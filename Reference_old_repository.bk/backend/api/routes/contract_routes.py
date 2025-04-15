from pathlib import Path
from fastapi import APIRouter, Query, HTTPException, Body, WebSocket
from core.language_handlers.solidity.hardhat.deployment_helper import HardhatDeploymentHelper as ContractDeployer
from core.language_handlers.web3.chain_setup import NetworkConfig
from core.project_setup.initializer import ProjectInitializer
from core.project_setup.template_manager import ProjectTemplateManager
from core.ai_integration.generators.dynamic_contract_gen import DynamicContractGenerator
from typing import List
from pydantic import BaseModel
import json
from backend.core.llama.bridge import LlamaBridge

router = APIRouter()
llama = LlamaBridge()

class ContractRequest(BaseModel):
    contract_type: str
    features: List[str]

@router.post("/init-project")
async def init_project(project_path: str = Query(..., description="Path to initialize project")):
    initializer = ProjectInitializer()
    template_manager = ProjectTemplateManager()
    template = template_manager.get_default_template()
    initializer.create_project(project_path, template)
    return {"message": f"Project initialized at {project_path}"}

@router.post("/deploy-contract")
async def deploy_contract(contract_name: str, network: str):
    deployer = ContractDeployer()
    network_config = NetworkConfig(network)
    address = deployer.deploy(contract_name, network_config)
    return {"message": f"Contract {contract_name} deployed to {network}", "address": address}

@router.post("/generate-contract")
async def generate_contract(request: ContractRequest):
    generator = DynamicContractGenerator()
    contract = generator.generate_contract(
        request.contract_type,
        request.features
    )
    
    contract_path = Path("test-project/src/contracts")
    contract_path.mkdir(parents=True, exist_ok=True)
    
    contract_file = contract_path / f"{request.contract_type}.sol"
    contract_file.write_text(contract)
    
    return {
        "contract": contract,
        "file_path": str(contract_file)
    }

@router.websocket("/ws/chat")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    while True:
        message = await websocket.receive_text()
        response = await llama.process_message(message)
        # Convert dictionary to JSON string for WebSocket transmission
        await websocket.send_text(json.dumps(response))

@router.post("/api/v1/chat")
async def chat(message: str):
    response = await llama.process_message(message)
    return {"response": response}