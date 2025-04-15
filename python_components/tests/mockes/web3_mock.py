from unittest.mock import MagicMock
from web3 import Web3 as RealWeb3
from web3.providers import BaseProvider
from web3.types import RPCEndpoint, RPCResponse
from typing import Union, Any, Dict



class MockProvider(BaseProvider):
    def __init__(self, endpoint_uri: str = "http://localhost:8545"):
        super().__init__()
        self.endpoint_uri = endpoint_uri
        
    def make_request(self, method: Union[RPCEndpoint, str], params: Any) -> RPCResponse:
        return {
            "jsonrpc": "2.0",
            "id": 1,
            "result": True
        }
    

class MockEthModule:
    def __init__(self):
        self.chain_id = 1
        self.accounts = ["0x742d35Cc6634C0532925a3b844Bc454e4438f44e"]
        self.block_number = 0
        
    def get_block_number(self):
        return self.block_number
        
    def get_transaction_count(self, address):
        return 0
        
    def get_balance(self, address):
        return 1000000000000000000







# class MockWeb3:
#     def __init__(self):
#         self.eth = MockEthModule()
#         self.middleware_onion = MagicMock()
#         self._provider = MockProvider("http://localhost:8545")
        
#     @staticmethod
#     def HTTPProvider(endpoint_uri: str) -> MockProvider:
#         return MockProvider(endpoint_uri)

#     def is_connected(self) -> bool:
#         return True
        
#     def __class__(self):
#         return RealWeb3.__class__  # Return the actual Web3 class instead of instance


# class MockWeb3:
#     HTTPProvider = MockProvider
    
#     def __init__(self):
#         self._eth = MockEthModule()
#         self._middleware_onion = MagicMock()
#         self._provider = self.HTTPProvider()
#         self.manager = MagicMock()
#         self._is_connected = True
    
#     @property
#     def eth(self):
#         return self._eth
    
#     @property
#     def middleware_onion(self):
#         return self._middleware_onion
    
#     def is_connected(self, show_traceback: bool = False) -> bool:
#         return True


class MockWeb3:
    HTTPProvider = MockProvider
    
    def __init__(self, provider=None):
        self._eth = MockEthModule()
        self._middleware_onion = MagicMock()
        self._provider = provider if provider else self.HTTPProvider()
        self.manager = MagicMock()
        
    @property
    def eth(self):
        return self._eth
    
    @property
    def middleware_onion(self):
        return self._middleware_onion
    
    def is_connected(self, show_traceback: bool = False) -> bool:
        return True