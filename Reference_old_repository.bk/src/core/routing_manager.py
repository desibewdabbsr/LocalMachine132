class AIRoutingManager:
    """Manages routing between different AI providers based on query type and quota"""
    
    def __init__(self, ai_controller):
        self.ai_controller = ai_controller
        self.quota = {
            "cody": 100,  # Example monthly query limit
            "cohere": 500  # Example monthly query limit
        }
        self.usage = {
            "cody": 0,
            "cohere": 0
        }
    
    def determine_best_model(self, request_message):
        """Determines the best model to use based on message content and quotas"""
        
        # If user specifically requested a model, honor that choice
        if self.ai_controller.model_type != "auto":
            return self.ai_controller.model_type
            
        # Check if it's a code generation task
        is_code_task = self._is_code_generation_task(request_message)
        
        if is_code_task:
            # For code tasks, prefer local models if possible
            if self._check_local_model_availability("deepseek"):
                return "deepseek"
                
            # If Cody has available quota and the task is complex, use Cody
            if self.usage["cody"] < self.quota["cody"] and self._is_complex_code_task(request_message):
                self.usage["cody"] += 1
                return "cody"
                
            # Fallback to mistral for simpler code tasks
            return "mistral"
        else:
            # For general conversation, prefer mistral
            return "mistral"
    
    def _is_code_generation_task(self, request_message):
        """Detect if the message is asking for code generation"""
        code_keywords = [
            "code", "function", "implement", "create", "build", 
            "develop", "write", "generate", "class", "method",
            "api", "endpoint", "app", "application", "software"
        ]
        
        return any(keyword in request_message.lower() for keyword in code_keywords)
    
    def _is_complex_code_task(self, request_message):
        """Determine if a code task is complex enough to warrant using Cody"""
        complex_indicators = [
            "complex", "advanced", "sophisticated", "enterprise",
            "architecture", "system", "framework", "full-stack",
            "database", "api", "react", "angular", "machine learning",
            "application", "deployment", "cloud", "authentication"
        ]
        
        # Count how many complex indicators appear in the message
        complexity_score = sum(1 for indicator in complex_indicators 
                              if indicator in request_message.lower())
                              
        # If message is long and has multiple complex indicators, it's complex
        return len(request_message.split()) > 40 and complexity_score >= 2
    
    def _check_local_model_availability(self, model_name):
        """Check if a local model is available and running"""
        if model_name == "deepseek":
            # Check if Deepseek is available through Ollama
            try:
                import requests
                response = requests.get("http://localhost:11434/api/tags")
                if response.status_code == 200:
                    models = response.json().get("models", [])
                    return any(m["name"].startswith("deepseek") for m in models)
            except:
                return False
                
        elif model_name == "mistral":
            # Check if Mistral model file exists and is readable
            from pathlib import Path
            import os
            model_path = Path("models/mistral-7b.gguf")
            return model_path.exists() and os.access(model_path, os.R_OK)
            
        return False