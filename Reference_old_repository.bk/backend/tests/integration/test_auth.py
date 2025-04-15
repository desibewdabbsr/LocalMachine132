import pytest
from fastapi import FastAPI, Depends
from fastapi.testclient import TestClient
from datetime import datetime
import jwt
from backend.api.middleware.auth import AuthHandler, AuthConfig

app = FastAPI()
auth_handler = AuthHandler()

@app.get("/protected")
async def protected_route(payload = Depends(auth_handler.authenticate)):
    return {"message": "Access granted", "user": payload}

client = TestClient(app)

@pytest.mark.integration
class TestAuthHandler:
    def setup_method(self):
        self.auth_handler = AuthHandler()
        self.valid_user_data = {
            "user_id": "test_user",
            "role": "admin"
        }

    def test_token_creation(self):
        token = self.auth_handler.create_access_token(self.valid_user_data)
        assert token is not None
        assert isinstance(token, str)

        payload = jwt.decode(
            token,
            self.auth_handler.config.SECRET_KEY,
            algorithms=[self.auth_handler.config.ALGORITHM]
        )
        assert payload["user_id"] == self.valid_user_data["user_id"]
        assert payload["role"] == self.valid_user_data["role"]
        assert "exp" in payload

    def test_protected_route_access(self):
        token = self.auth_handler.create_access_token(self.valid_user_data)
        response = client.get(
            "/protected",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        assert response.json()["message"] == "Access granted"
        assert response.json()["user"]["user_id"] == self.valid_user_data["user_id"]

    def test_protected_route_no_token(self):
        response = client.get("/protected")
        assert response.status_code == 403

    def test_invalid_token(self):
        response = client.get(
            "/protected",
            headers={"Authorization": "Bearer invalid.token.here"}
        )
        assert response.status_code == 401


# pytest backend/tests/integration/test_auth.py -v