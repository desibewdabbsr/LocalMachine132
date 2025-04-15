from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from datetime import datetime
import json
from utils.logger import AdvancedLogger

@dataclass
class ResponseMetrics:
    processing_time: float
    token_count: int
    confidence_score: float
    code_blocks_count: int

class ResponseHandler:
    def __init__(self):
        self.logger = AdvancedLogger().get_logger("response_handler")
        self.response_history: List[Dict[str, Any]] = []
        self.metrics_history: List[ResponseMetrics] = []


    async def process_response(self, raw_response: str, context: Optional[Dict] = None) -> str:
        if not raw_response.strip():
            raise ValueError("Empty response received")
        
        start_time = datetime.now()
        try:
            code_blocks = self._extract_code_blocks(raw_response)
            processed_response = self._clean_response(raw_response)
            processed_response = self._format_response(processed_response, code_blocks)
            
            metrics = self._calculate_metrics(raw_response, processed_response, start_time)
            self._update_history(raw_response, processed_response, metrics, context)
            
            return processed_response
        except Exception as e:
            self.logger.error(json.dumps({
                "message": "Response processing failed",
                "error": str(e)
            }))
            raise

        
    def _extract_code_blocks(self, response: str) -> List[Dict[str, str]]:
        blocks = []
        lines = response.split('\n')
        in_block = False
        current_block = []
        current_language = ""

        for line in lines:
            if line.strip().startswith('```'):
                if in_block:
                    blocks.append({
                        'language': current_language,
                        'code': '\n'.join(current_block)
                    })
                    current_block = []
                    in_block = False
                else:
                    in_block = True
                    current_language = line.strip().replace('```', '').strip()
            elif in_block:
                current_block.append(line)

        return blocks
    

    def _clean_response(self, response: str) -> str:
        lines = [line.strip() for line in response.splitlines() if line.strip()]
        cleaned = '\n'.join(lines)
        return cleaned.replace('###', '#')




    def _format_response(self, 
                        response: str, 
                        code_blocks: List[Dict[str, str]]) -> str:
        """Format response with proper structure and code blocks"""
        formatted = response
        
        # Add code block formatting if missing
        for block in code_blocks:
            if block['code'] not in formatted:
                formatted += f"\n\n```{block['language']}\n{block['code']}\n```"
                
        return formatted

    def _calculate_metrics(self, 
                         raw: str, 
                         processed: str, 
                         start_time: datetime) -> ResponseMetrics:
        """Calculate response processing metrics"""
        return ResponseMetrics(
            processing_time=(datetime.now() - start_time).total_seconds(),
            token_count=len(processed.split()),
            confidence_score=self._calculate_confidence(raw, processed),
            code_blocks_count=processed.count('```') // 2
        )

    def _calculate_confidence(self, raw: str, processed: str) -> float:
        """Calculate confidence score based on response quality"""
        # Implement confidence scoring logic
        if not raw or not processed:
            return 0.0
            
        # Basic scoring based on content preservation
        raw_words = set(raw.split())
        processed_words = set(processed.split())
        preservation_ratio = len(processed_words) / len(raw_words)
        
        return min(1.0, preservation_ratio)

    def _update_history(self, 
                       raw: str, 
                       processed: str, 
                       metrics: ResponseMetrics,
                       context: Optional[Dict] = None) -> None:
        """Update response history with metrics"""
        entry = {
            "timestamp": datetime.now().isoformat(),
            "raw_length": len(raw),
            "processed_length": len(processed),
            "metrics": metrics.__dict__,
            "context": context
        }
        
        self.response_history.append(entry)
        self.metrics_history.append(metrics)
        
        # Maintain history size
        if len(self.response_history) > 1000:
            self.response_history = self.response_history[-1000:]
            self.metrics_history = self.metrics_history[-1000:]

    def get_metrics_summary(self) -> Dict[str, Any]:
        """Get summary of response processing metrics"""
        if not self.metrics_history:
            return {}
            
        return {
            "average_processing_time": sum(m.processing_time for m in self.metrics_history) / len(self.metrics_history),
            "average_confidence": sum(m.confidence_score for m in self.metrics_history) / len(self.metrics_history),
            "total_responses": len(self.metrics_history),
            "code_blocks_processed": sum(m.code_blocks_count for m in self.metrics_history)
        }