import asyncio
import re
from typing import Optional, List, Tuple, Dict, Any, Union

class SocketIOHandlers:
    """Socket.IO event handlers for the web application"""
    
    def __init__(self, socketio, chat_service, project_generator, file_service=None):
        """Initialize with required services"""
        self.socketio = socketio
        self.chat_service = chat_service
        self.project_generator = project_generator
        self.file_service = file_service
        



    def extract_code_blocks(self, content: str) -> List[Tuple[str, str]]:
        """Extract code blocks from markdown content"""
        pattern = r"```(\w*)\n(.*?)```"
        matches = re.findall(pattern, content, re.DOTALL)
        # Strip trailing newlines from code blocks
        return [(lang, code.rstrip('\n')) for lang, code in matches]

    def get_file_extension(self, language: str) -> str:
        """Get file extension for language"""
        extensions = {
            "python": "py",
            "javascript": "js",
            "typescript": "ts",
            "solidity": "sol",
            "node": "js",
            "html": "html",
            "css": "css",
            "json": "json",
            "bash": "sh",
            "shell": "sh",
            "java": "java",
            "c": "c",
            "cpp": "cpp",
            "csharp": "cs",
            "go": "go",
            "rust": "rs",
            "ruby": "rb",
            "php": "php",
            "swift": "swift",
            "kotlin": "kt"
        }
        return extensions.get(language.lower(), "txt")

    def register_handlers(self):
        """Register all Socket.IO event handlers"""
        @self.socketio.on('connect')
        def handle_connect():
            print('Client connected')

        @self.socketio.on('disconnect')
        def handle_disconnect():
            print('Client disconnected')

        @self.socketio.on('send_message')
        def handle_message(data):
            print(f"Received message: {data}")
            message = data.get('message', '')
            model = data.get('model', 'auto')

            # Process with AI service
            self.chat_service.set_model(model)
            print(f"Set model to: {model}")

            # Fix: Create a non-async wrapper function for the background task
            def run_process_message():
                asyncio.run(self._process_message(message))
            
            # Use the non-async wrapper
            self.socketio.start_background_task(run_process_message)
            

        @self.socketio.on('generate_code')
        def handle_code_generation(data):
            """Handle code generation requests"""
            print(f"Received code generation request: {data}")
            prompt = data.get('prompt', '')
            model = data.get('model', 'auto')
            
            # Immediately emit a process started event to update the UI
            self.socketio.emit('ai_process', {
                "process": "Code Generation",
                "message": f"Starting code generation for: {prompt[:50]}..."
            })
            
            # Process with AI service
            if self.chat_service:
                self.chat_service.set_model(model)
            
            # Define the function before using it
            def run_code_generation():
                asyncio.run(self._generate_code(prompt))
            
            # Now use the function
            self.socketio.start_background_task(run_code_generation)



        # # In the register_handlers method, fix the run_code_generation function:
        # @self.socketio.on('generate_code')
        # def handle_code_generation(data):
        #     """Handle code generation requests"""
        #     print(f"Received code generation request: {data}")
        #     prompt = data.get('prompt', '')
        #     model = data.get('model', 'auto')

        #     # Immediately emit a process started event to update the UI
        #     self.socketio.emit('ai_process', {
        #         "process": "Code Generation",
        #         "message": f"Starting code generation for: {prompt[:50]}..."
        #     })

        #     # Process with AI service
        #     if self.chat_service:
        #         self.chat_service.set_model(model)

        #     # Define the function before using it
        #     def run_code_generation():
        #         asyncio.run(self._generate_code(prompt))

        #     # Use the non-async wrapper
        #     self.socketio.start_background_task(run_code_generation)

    async def _generate_code(self, prompt):
        """Generate code asynchronously"""
        try:
            # Emit progress update
            self.socketio.emit('ai_process', {
                "process": "Code Generation",
                "message": "Generating code..."
            })
            
            # Get response from AI controller
            try:
                # Try to use generate_code if available
                if hasattr(self.chat_service, 'generate_code'):
                    response = await self.chat_service.generate_code(prompt)
                else:
                    # Fallback to process_message
                    response = await self.chat_service.process_message(f"Generate code for: {prompt}")
            except Exception as e:
                print(f"Error calling AI service: {e}")
                response = {
                    "content": f"I'll help you write code for: {prompt}\n\n```python\n# Example code\nprint('Hello, world!')\n```",
                    "error": str(e)
                }
            
            # Extract content
            if isinstance(response, dict):
                content = response.get('content', '')
            else:
                content = str(response)
            
            # Extract code blocks from the content
            code_blocks = self.extract_code_blocks(content)
            
            # Emit progress update
            self.socketio.emit('ai_process', {
                "process": "Code Generation",
                "message": "Code generated, processing files..."
            })
            
            # Process code blocks directly here instead of relying on file_service
            for i, (language, code) in enumerate(code_blocks):
                # Generate a meaningful file name based on language and content
                file_ext = self.get_file_extension(language)
                
                # Try to extract a meaningful name from the code
                import re
                file_name = f"generated_{i}.{file_ext}"
                
                # For Solidity, try to extract contract name
                if language.lower() == 'solidity':
                    contract_match = re.search(r'contract\s+(\w+)', code)
                    if contract_match:
                        file_name = f"{contract_match.group(1)}.{file_ext}"
                
                # For Python, try to extract class or function name
                elif language.lower() == 'python':
                    class_match = re.search(r'class\s+(\w+)', code)
                    if class_match:
                        file_name = f"{class_match.group(1)}.{file_ext}"
                    else:
                        func_match = re.search(r'def\s+(\w+)', code)
                        if func_match:
                            file_name = f"{func_match.group(1)}.{file_ext}"
                
                # Create a project name based on the prompt
                project_name = "generated"
                if len(prompt) > 5:
                    # Create a slug from the prompt
                    import re
                    slug = re.sub(r'[^a-zA-Z0-9]', '_', prompt.lower())
                    slug = re.sub(r'_+', '_', slug)  # Replace multiple underscores with one
                    slug = slug[:20]  # Limit length
                    project_name = f"generated_{slug}"
                
                # Emit the code generation event with proper file information
                self.socketio.emit('code_generation', {
                    "file_name": file_name,
                    "code": code,
                    "language": language,
                    "project": project_name,
                    "path": f"{project_name}/{file_name}"
                })
                
                # Then save the file in the background
                if self.file_service:
                    try:
                        # Use the correct parameters for save_file method
                        file_info = self.file_service.save_file(
                            content=code,
                            project_name=project_name,
                            file_name=file_name,
                            file_type=file_ext
                        )
                        print(f"File saved successfully: {file_info}")
                    except Exception as e:
                        print(f"Error saving file: {e}")
            
            # Also emit regular response
            self.socketio.emit('ai_response', {"response": content})
            
            # Final process update
            self.socketio.emit('ai_process', {
                "process": "Code Generation",
                "message": "Code generation completed"
            })
        except Exception as e:
            print(f"Error in code generation: {e}")
            import traceback
            traceback.print_exc()
            self.socketio.emit('ai_response', {"response": f"Error generating code: {str(e)}"})
            
            # Error process update
            self.socketio.emit('ai_process', {
                "process": "Code Generation",
                "message": f"Error: {str(e)}"
            })


    async def _process_message(self, message):
        """Process a message asynchronously"""
        try:
            # Check for simple greetings first
            simple_greetings = ["hi", "hello", "hey", "greetings"]
            if message.lower().strip() in simple_greetings:
                greeting_response = "Hello! I'm your AI assistant. How can I help you today?"
                self.socketio.emit('ai_response', {"response": greeting_response})
                return
                
            # Process the message using the async method
            response = await self.chat_service.process_message(message)
            
            # Format the response
            if isinstance(response, dict) and 'content' in response:
                response_content = response['content']
            elif isinstance(response, str):
                response_content = response
            else:
                response_content = f"I received your message: '{message}'. However, I'm currently experiencing technical difficulties with my response generation system."
            
            # Check for template response
            if isinstance(response_content, str) and "Generated smart contract for ethereum" in response_content:
                # Replace template with a better response
                response_content = f"Hello! I received your message: '{message}'. How can I assist you today?"
            
            # Emit the response
            self.socketio.emit('ai_response', {"response": response_content})
        except Exception as e:
            print(f"Error processing message: {e}")
            import traceback
            traceback.print_exc()
            self.socketio.emit('ai_response', {"response": f"Error processing request: {str(e)}"})
    

