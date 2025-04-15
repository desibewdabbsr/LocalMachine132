import pytest
from datetime import datetime
from core.ai_integration.llama.response_handler import ResponseHandler, ResponseMetrics

@pytest.fixture
def response_handler():
    return ResponseHandler()

class TestResponseHandler:
    @pytest.mark.asyncio
    async def test_basic_response_processing(self, response_handler):
        raw_response = "Here's a simple example:\n```python\nprint('hello')\n```"
        processed = await response_handler.process_response(raw_response)
        assert "```python" in processed
        assert "print('hello')" in processed

    def test_code_block_extraction(self, response_handler):
        response = """Here's the code:
        ```python
        def test():
            pass
        ```
        And another:
        ```javascript
        console.log('test');
        ```"""
        
        blocks = response_handler._extract_code_blocks(response)
        assert len(blocks) == 2
        assert blocks[0]['language'] == 'python'
        assert blocks[1]['language'] == 'javascript'

    def test_response_cleaning(self, response_handler):
        messy_response = "### Title\n\n\nContent   \n\n  More content"
        cleaned = response_handler._clean_response(messy_response)
        assert cleaned == "# Title\nContent\nMore content"

    def test_metrics_calculation(self, response_handler):
        raw = "Test response"
        processed = "Test response with formatting"
        start_time = datetime.now()
        
        metrics = response_handler._calculate_metrics(raw, processed, start_time)
        assert isinstance(metrics, ResponseMetrics)
        assert metrics.confidence_score <= 1.0
        assert metrics.confidence_score >= 0.0

    @pytest.mark.asyncio
    async def test_context_aware_processing(self, response_handler):
        context = {"format": "markdown", "code_style": "clean"}
        response = "Test response"
        processed = await response_handler.process_response(response, context)
        
        history = response_handler.response_history[-1]
        assert history["context"] == context

    def test_metrics_summary(self, response_handler):
        # Process multiple responses to generate metrics
        responses = ["Test 1", "Test 2", "Test 3"]
        for resp in responses:
            response_handler._update_history(
                resp, 
                resp, 
                ResponseMetrics(0.1, 10, 0.9, 1),
                None
            )
            
        summary = response_handler.get_metrics_summary()
        assert "average_processing_time" in summary
        assert "total_responses" in summary
        assert summary["total_responses"] == len(responses)

    @pytest.mark.asyncio
    async def test_error_handling(self, response_handler):
        with pytest.raises(ValueError):
            await response_handler.process_response("")

    def test_history_limit(self, response_handler):
        # Add more than 1000 entries
        for i in range(1100):
            response_handler._update_history(
                f"Test {i}",
                f"Processed {i}",
                ResponseMetrics(0.1, 10, 0.9, 1),
                None
            )
        
        assert len(response_handler.response_history) == 1000
        assert response_handler.response_history[-1]["raw_length"] == len("Test 1099")

    def test_confidence_calculation(self, response_handler):
        raw = "Original test response with specific content"
        processed = "Test response with some content"
        confidence = response_handler._calculate_confidence(raw, processed)
        assert 0 <= confidence <= 1