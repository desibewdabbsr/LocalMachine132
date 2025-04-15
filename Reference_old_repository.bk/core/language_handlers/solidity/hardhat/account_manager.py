   

from typing import List, Dict

class HardhatAccountManager:
    def __init__(self):
        self.accounts = [
            {
                "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
                "private_key": "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
                "balance": "10000"
            }
            # Add more accounts as needed
        ]
    
    def get_test_accounts(self, count: int = 5) -> List[Dict[str, str]]:
        """Get specified number of test accounts"""
        return self.accounts[:count]
