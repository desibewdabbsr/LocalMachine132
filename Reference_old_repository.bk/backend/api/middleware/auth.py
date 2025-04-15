from fastapi import Request, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Dict, Any
from datetime import datetime, timedelta, UTC
import jwt
from jwt.exceptions import ExpiredSignatureError, InvalidTokenError
from config.secrets_handler import SecretsHandler

class AuthConfig:
    _secrets_handler = SecretsHandler()
    secrets = _secrets_handler.get_secrets()
    SECRET_KEY = secrets["auth"]["secret_key"]
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 30
    TOKEN_TYPE = "bearer"

class AuthHandler:
    def __init__(self):
        self.security = HTTPBearer()
        self.config = AuthConfig()

    def create_access_token(self, data: Dict[str, Any]) -> str:
        to_encode = data.copy()
        expire = datetime.now(UTC) + timedelta(minutes=self.config.ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({"exp": expire})
        return jwt.encode(to_encode, self.config.SECRET_KEY, algorithm=self.config.ALGORITHM)

    async def verify_token(self, credentials: HTTPAuthorizationCredentials) -> Dict[str, Any]:
        try:
            payload = jwt.decode(
                credentials.credentials,
                self.config.SECRET_KEY,
                algorithms=[self.config.ALGORITHM]
            )
            return payload
        except ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired"
            )
        except InvalidTokenError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )

    async def authenticate(self, request: Request) -> Dict[str, Any]:
        credentials = await self.security(request)
        if credentials is None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No credentials provided"
            )
        return await self.verify_token(credentials)
    

# pytest backend/tests/integration/test_auth.py -v