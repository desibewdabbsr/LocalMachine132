from fastapi import APIRouter, WebSocket, HTTPException
from pydantic import BaseModel
from backend.core.llama.bridge import LlamaBridge
import json
from backend.core.cody.cody_bridge import CodyBridge

router = APIRouter()
llama_bridge = LlamaBridge()
cody_bridge = CodyBridge()


class ChatMessage(BaseModel):
    message: str


@router.post("/chat")
async def chat(message: ChatMessage):
    try:
        response = await cody_bridge.process_message(message.message)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@router.websocket("/ws/chat")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    while True:
        message = await websocket.receive_text()
        response = await llama_bridge.process_message(message)
        # Convert dictionary to JSON string before sending
        await websocket.send_text(json.dumps(response))