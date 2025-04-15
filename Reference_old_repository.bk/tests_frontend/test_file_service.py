import pytest
from pathlib import Path
import sys
import os
from unittest.mock import MagicMock, AsyncMock
from unittest.mock import MagicMock, patch



# Add the project root to the Python path
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.core.socketio_file_manager.file_service import FileService

@pytest.fixture
def mock_socketio():
    """Create a mock SocketIO instance"""
    socketio = MagicMock()
    return socketio

@pytest.fixture
def mock_core_backend():
    """Create a mock CoreBackendController"""
    core_backend = MagicMock()
    core_backend.available = True
    core_backend.generate_code = AsyncMock(return_value="def test_function():\n    return 'test'")
    return core_backend

@pytest.fixture
def file_service(mock_socketio, mock_core_backend):
    """Create a FileService instance with mocks"""
    return FileService(socketio=mock_socketio, core_backend=mock_core_backend)

def test_extract_code_blocks(file_service):
    """Test extracting code blocks from markdown content"""
    # Test with a single code block
    content = "Here's some code:\n```python\nprint('hello')\n```"
    blocks = file_service.extract_code_blocks(content)
    assert len(blocks) == 1
    assert blocks[0][0] == "python"
    assert blocks[0][1] == "print('hello')"  # Now expecting without trailing newline
    
    # Test with multiple code blocks
    content = "```js\nconst x = 5;\n```\nSome text\n```python\nprint('hello')\n```"
    blocks = file_service.extract_code_blocks(content)
    assert len(blocks) == 2
    assert blocks[0][0] == "js"
    assert blocks[0][1] == "const x = 5;"
    assert blocks[1][0] == "python"
    assert blocks[1][1] == "print('hello')"

def test_process_code_generation(file_service, mock_socketio, mock_core_backend):
    """Test processing code generation"""
    # Mock the necessary methods
    file_service._detect_language = MagicMock(return_value="python")
    file_service._generate_file_name = MagicMock(return_value="test_function.py")
    file_service._save_file = MagicMock(return_value={
        "name": "test_function.py",
        "path": "/test_project/test_function.py",
        "type": "py",
        "size": 15
    })
    
    # Test with direct core backend call
    prompt = "Generate a Python function"
    content = "Here's a function:\n```python\ndef test_function():\n    return 'test'\n```"
    
    file_service.process_code_generation(prompt, content)
    
    # Check that the core backend was called
    mock_core_backend.generate_code.assert_called_once()
    
    # Check that the file was saved
    file_service._save_file.assert_called_once()
    
    # Check that the code_generation event was emitted
    mock_socketio.emit.assert_any_call('code_generation', {
        "name": "test_function.py",
        "path": "/test_project/test_function.py",
        "type": "py",
        "size": 15
    })



def test_detect_language(file_service):
    """Test language detection from code content"""
    # Test Solidity detection
    solidity_code = "pragma solidity ^0.8.0;\n\ncontract MyContract {}"
    assert file_service._detect_language(solidity_code) == "solidity"
    
    # Test Python detection
    python_code = "def hello():\n    print('Hello, world!')"
    assert file_service._detect_language(python_code) == "python"
    
    # Test JavaScript detection
    js_code = "function hello() {\n    console.log('Hello, world!');\n}"
    assert file_service._detect_language(js_code) == "javascript"
    
    # Test TypeScript detection
    ts_code = "interface User {\n    name: string;\n}\n\nfunction hello(): void {}"
    assert file_service._detect_language(ts_code) == "typescript"
    
    # Test HTML detection
    html_code = "<!doctype html>\n<html><body>Hello</body></html>"
    assert file_service._detect_language(html_code) == "html"
    
    # Test CSS detection
    css_code = "body {\n    color: red;\n}"
    assert file_service._detect_language(css_code) == "css"
    
    # Test default
    unknown_code = "This is just plain text"
    assert file_service._detect_language(unknown_code) == "text"

def test_generate_file_name(file_service):
    """Test file name generation based on code content"""
    # Test Solidity contract name extraction
    solidity_code = "pragma solidity ^0.8.0;\n\ncontract MyContract {}"
    assert file_service._generate_file_name(solidity_code, "solidity") == "MyContract.sol"
    
    # Test Python class name extraction
    python_class = "class MyClass:\n    def __init__(self):\n        pass"
    assert file_service._generate_file_name(python_class, "python") == "MyClass.py"
    
    # Test Python function name extraction
    python_func = "def my_function():\n    return 'Hello'"
    assert file_service._generate_file_name(python_func, "python") == "my_function.py"
    
    # Test JavaScript class name extraction
    js_class = "class MyJSClass {\n    constructor() {}\n}"
    assert file_service._generate_file_name(js_class, "javascript") == "MyJSClass.js"
    
    # Test JavaScript function name extraction
    js_func = "function myJSFunction() {\n    return 'Hello';\n}"
    assert file_service._generate_file_name(js_func, "javascript") == "myJSFunction.js"
    
    # Test default name generation
    unknown_code = "This is just plain text"
    assert file_service._generate_file_name(unknown_code, "text") == "generated_code.txt"

def test_get_file_extension(file_service):
    """Test file extension mapping"""
    assert file_service._get_file_extension("python") == "py"
    assert file_service._get_file_extension("javascript") == "js"
    assert file_service._get_file_extension("typescript") == "ts"
    assert file_service._get_file_extension("solidity") == "sol"
    assert file_service._get_file_extension("html") == "html"
    assert file_service._get_file_extension("css") == "css"
    assert file_service._get_file_extension("text") == "txt"
    assert file_service._get_file_extension("unknown") == "txt"




def test_save_file(file_service, tmpdir, monkeypatch):
    """Test saving code to a file"""
    # Create a Path object for the temporary directory
    temp_dir = Path(tmpdir)
    
    # Monkeypatch the Path constructor to return our temp directory
    def mock_path(*args, **kwargs):
        return temp_dir
    
    # Apply the monkeypatch only for the specific path we're creating
    monkeypatch.setattr(file_service, '_get_project_dir', lambda: temp_dir)
    
    # Test saving a file
    code = "def test_function():\n    return 'test'"
    file_name = "test_file.py"
    
    file_info = file_service._save_file(code, file_name)
    
    # Check that the file info is correct
    assert file_info["name"] == file_name
    assert str(temp_dir / file_name) in file_info["path"]
    assert file_info["type"] == "py"
    assert file_info["size"] == len(code)
    
    # Check that the file was actually saved
    with open(temp_dir / file_name, "r") as f:
        assert f.read() == code


def test_list_projects(file_service, tmpdir, monkeypatch):
    """Test listing projects"""
    # Create a temporary directory structure for testing
    temp_dir = Path(tmpdir)
    projects_dir = temp_dir / "projects"
    projects_dir.mkdir()
    
    # Create a test project
    test_project_dir = projects_dir / "test_project"
    test_project_dir.mkdir()
    
    # Create some test files
    test_file1 = test_project_dir / "test_file.py"
    test_file1.write_text("def test():\n    pass")
    
    test_file2 = test_project_dir / "test_file2.js"
    test_file2.write_text("function test() {}")
    
    # Call the method with the temporary projects directory
    projects = file_service.list_projects(projects_dir_path=projects_dir)
    
    # Check the result
    assert len(projects) == 1
    assert projects[0]["name"] == "test_project"
    assert len(projects[0]["files"]) == 2
    
    # Check that the files are correctly listed
    file_names = [f["name"] for f in projects[0]["files"]]
    assert "test_file.py" in file_names
    assert "test_file2.js" in file_names