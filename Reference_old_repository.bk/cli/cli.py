import argparse
import requests
import websockets
import json
import asyncio
import signal
import sys
import os

# Add project root to path
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(project_root)

# Now import our modules
from config.config_manager import ConfigManager
from core.ai_integration.cody.code_generator import CodeGenerator
from backend.core.llama.bridge import LlamaBridge

from backend.core.cody.cody_bridge import CodyBridge


API_BASE_URL = "http://localhost:8000"

def init_project(project_path):
    response = requests.post(f"{API_BASE_URL}/init-project", json={"project_path": project_path})
    print(response.json()["message"])

def deploy_contract(contract_name, network):
    response = requests.post(f"{API_BASE_URL}/deploy-contract", json={"contract_name": contract_name, "network": network})
    print(response.json()["message"])

def generate_contract(contract_type, features):
    response = requests.post(f"{API_BASE_URL}/generate-contract", json={"contract_type": contract_type, "features": features})
    print(response.json()["contract"])




async def chat_websocket():
    config = ConfigManager().load_config()
    if not config['ai']['llama']['enabled']:
        cody_bridge = CodyBridge()
        try:
            message = input("Cody> ")
            response = await cody_bridge.process_message(message)
            print("\n[Cody Response]")
            print("-" * 50)
            print(response['result'])
            print("-" * 50)
        except Exception as e:
            print(f"Cody error: {str(e)}")
        return


    uri = "http://localhost:11434/api/generate"
    print("\nConnecting to Llama...")
    
    try:
        message = input("You: ")
        payload = {
            "model": "deepseek-coder:1.3b",
            "prompt": f"""You are an AI assistant that controls Cody services. 
When asked about Cody's status or control commands, respond with appropriate status information.
Current request: {message}""",
            "stream": False
        }
        
        api_response = requests.post(uri, json=payload)
        if api_response.ok:
            result = api_response.json()
            
            # Handle Cody control commands
            if any(cmd in message.lower() for cmd in ["enable cody", "disable cody", "check cody"]):
                bridge = LlamaBridge()
                control_response = await bridge._handle_cody_command(message)
                print(f"\n[Llama Control Response]")
                print("-" * 50)
                print(control_response["content"])
            else:
                print(f"\n[Llama Solo Response]")
                print("-" * 50)
                print(result.get('response', ''))
            print("-" * 50)
    except Exception as e:
        print(f"\nError during chat: {str(e)}")

def chat_command(message: str):
    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        loop.run_until_complete(chat_websocket())
    except KeyboardInterrupt:
        print("\nChat ended by user")
    except Exception as e:
        print(f"Chat error: {str(e)}")



def signal_handler(sig, frame):
    print("\nGracefully exiting chat...")
    sys.exit(0)




def main():
    parser = argparse.ArgumentParser(description="Pop Dev Assistant CLI")
    subparsers = parser.add_subparsers(dest="command")

    # Init command
    init_parser = subparsers.add_parser("init", help="Initialize a new project")
    init_parser.add_argument("project_path", type=str, help="Path to the project")

    # Deploy command
    deploy_parser = subparsers.add_parser("deploy", help="Deploy a contract")
    deploy_parser.add_argument("contract_name", type=str, help="Name of the contract")
    deploy_parser.add_argument("network", type=str, help="Network to deploy to")

    # Generate command
    generate_parser = subparsers.add_parser("generate", help="Generate a contract")
    generate_parser.add_argument("contract_type", type=str, help="Type of contract")
    generate_parser.add_argument("features", nargs="+", help="Features of the contract")
    
    # llama
    parser.add_argument("--chat", type=str, help="Start chat with Llama")

    args = parser.parse_args()

    signal.signal(signal.SIGINT, signal_handler)

    
    if args.chat:
        try:
            chat_command(args.chat)
        except Exception as e:
            print(f"Chat error: {str(e)}")
            sys.exit(1)
    if args.command == "init":
        init_project(args.project_path)
    elif args.command == "deploy":
        deploy_contract(args.contract_name, args.network)
    elif args.command == "generate":
        generate_contract(args.contract_type, args.features)
    else:
        parser.print_help()
    if args.chat:
            asyncio.get_event_loop().run_until_complete(chat_websocket())



if __name__ == "__main__":
    main()