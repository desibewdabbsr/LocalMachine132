import sys
import os

from pathlib import Path
sys.path.append(str(Path(__file__).parent))


# llama
from fastapi import FastAPI
from backend.api.routes import contract_routes, health_routes, metrics_routes, chat_routes

# Add the root directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI
from backend.api.routes import contract_routes, health_routes, metrics_routes

from backend.api.routes.chat_routes import router as chat_router

from backend.api.routes import contract_routes, health_routes, metrics_routes

from backend.api.routes import chat_routes


from backend.core.cody.cody_bridge import CodyBridge
from backend.core.llama.bridge import LlamaBridge

app = FastAPI()
cody_bridge = CodyBridge()


# Include all routers
app.include_router(contract_routes.router, prefix="/api/v1")
app.include_router(health_routes.router, prefix="/api/v1")
app.include_router(metrics_routes.router, prefix="/api/v1")
app.include_router(chat_routes.router, prefix="/api/v1")
app.include_router(chat_router, prefix="/api/v1")
app.include_router(chat_routes.router)




# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy"}