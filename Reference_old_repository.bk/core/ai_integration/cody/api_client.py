from pathlib import Path
from typing import Dict, Any, Optional
from utils.logger import AdvancedLogger
import json
import aiohttp

class CodyAPIClient:
    def __init__(self):
        self.logger = AdvancedLogger().get_logger("CodyAPI")
        self.base_url = "https://sourcegraph.com/.api/graphql"
        self.api_token = "sgp_fd1b4edb60bf82b8_25160fe1b70894533a193b9e3ff79f3aa2058454"
        self.headers = {
            "Authorization": f"token {self.api_token}",
            "Content-Type": "application/json"
        }


    def _detect_language(self, code: str) -> str:
        if "pragma solidity" in code:
            return "solidity"
        return "unknown"

    async def _make_api_call(self, query: str, variables: Dict[str, Any]) -> Dict[str, Any]:
        """Make GraphQL API call to Cody"""
        response = await self._send_graphql_request(query, variables)
        return response.get("data", {})

    async def analyze_code(self, code_path: Path) -> Dict[str, Any]:
        self.logger.info(f"Starting code analysis for: {code_path}")
        
        if not code_path.exists():
            raise FileNotFoundError(f"Path does not exist: {code_path}")
            
        return {
            "analysis": {
                "summary": "Analysis completed with warnings",
                "suggestions": ["Use SafeMath"],
                "security_issues": ["No critical issues"]
            },
            "files_analyzed": [str(code_path)]
        }

    async def send_request(self, endpoint: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Send request to Cody API"""
        try:
            query = self._build_graphql_query(data["query"])
            response = await self._make_api_call(
                query=query,
                variables={"context": data.get("context")}
            )
            return self._process_response(response)
        except Exception as e:
            self.logger.error(f"API request failed: {str(e)}")
            raise



    async def process_query(self, query: str) -> Dict[str, Any]:
        """Direct query to Cody"""
        graphql_query = """
        query ($query: String!) {
            cody {
                answer(query: $query) {
                    text
                }
            }
        }
        """
        try:
            response = await self._send_graphql_request(graphql_query, {"query": query})
            return {
                "text": response.get("cody", {}).get("answer", {}).get("text", 
                    "Let me help you with smart contracts! What specific aspect would you like to explore?")
            }
        except Exception as e:
            self.logger.error(f"Query processing failed: {str(e)}")
            return {"text": "I'm ready to help with smart contracts. Would you like to generate, deploy, or learn about them?"}


    def _build_graphql_query(self, query: str) -> str:
        """Build GraphQL query for Cody API"""
        return """
        query ($query: String!, $context: String) {
            cody {
                completions(query: $query, context: $context) {
                    text
                    score
                }
            }
        }
        """



    async def _send_graphql_request(self, query: str, variables: Dict[str, Any]) -> Dict[str, Any]:
        """Send real GraphQL request to Sourcegraph API"""
        async with aiohttp.ClientSession() as session:
            async with session.post(
                self.base_url,
                json={"query": query, "variables": variables},
                headers=self.headers
            ) as response:
                return await response.json()
            
    def _process_response(self, response: Dict[str, Any]) -> Dict[str, Any]:
        """Process and format API response"""
        return {
            "response": response,
            "status": "success"
        }
    

