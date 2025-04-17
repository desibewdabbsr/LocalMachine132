import os
import re
import pytest
import shutil
from pathlib import Path
from unittest.mock import patch
from datetime import datetime
import asyncio

from python_components.core.code_handler.code_file_handler import (
    LanguageDetector,
    FileNameGenerator,
    CodeFileHandler
)

# Test directory for file operations
TEST_DIR = Path("test_repositories")

@pytest.fixture(scope="function")
def setup_test_dir():
    """Create and clean up test directory for each test"""
    # Create test directory
    TEST_DIR.mkdir(exist_ok=True, parents=True)
    
    # Provide the test directory
    yield TEST_DIR
    
    # Clean up after test
    shutil.rmtree(TEST_DIR)

class TestLanguageDetector:
    """Tests for the LanguageDetector class"""

    # def get_default_filename(self, language: str) -> str:
    #     """Get the default filename for a language"""
    #     if language in self.LANGUAGE_PATTERNS:
    #         return self.LANGUAGE_PATTERNS[language]['default_filename']
    #     return "generated_code"
    
    def setup_method(self):
        self.detector = LanguageDetector()
    
    def test_detect_solidity(self):
        """Test detection of Solidity code"""
        code = """
        pragma solidity ^0.8.0;
        
        contract SimpleStorage {
            uint256 value;
            
            function set(uint256 _value) public {
                value = _value;
            }
            
            function get() public view returns (uint256) {
                return value;
            }
        }
        """
        
        language, extension = self.detector.detect_language(code)
        assert language == "solidity"
        assert extension == ".sol"
    
    def test_detect_python(self):
        """Test detection of Python code"""
        code = """
        def hello_world():
            print("Hello, World!")
            
        class MyClass:
            def __init__(self):
                self.value = 42
        """
        
        language, extension = self.detector.detect_language(code)
        assert language == "python"
        assert extension == ".py"
    
    def test_detect_javascript(self):
        """Test detection of JavaScript code"""
        code = """
        function calculateTotal(items) {
            return items.reduce((total, item) => total + item.price, 0);
        }
        
        const user = {
            name: 'John',
            age: 30
        };
        """
        
        language, extension = self.detector.detect_language(code)
        assert language == "javascript"
        assert extension == ".js"
    
    def test_detect_from_markdown_code_block(self):
        """Test detection from markdown code blocks"""
        code = """
        Here's a Solidity contract:
        
        ```solidity
        pragma solidity ^0.8.0;
        
        contract SimpleStorage {
            uint256 value;
        }
        ```
        """
        
        language, extension = self.detector.detect_language(code)
        assert language == "solidity"
        assert extension == ".sol"
    
    def test_fallback_detection(self):
        """Test fallback to default when language can't be detected"""
        code = """
        This is just plain text with no code indicators.
        """
        
        language, extension = self.detector.detect_language(code)
        assert language == "javascript"  # Default fallback
        assert extension == ".js"

class TestFileNameGenerator:
    """Tests for the FileNameGenerator class"""
    
    def setup_method(self):
        self.detector = LanguageDetector()
        self.generator = FileNameGenerator(self.detector)
    
    def test_extract_name_from_solidity(self):
        """Test extracting name from Solidity code"""
        code = """
        pragma solidity ^0.8.0;
        
        contract SimpleStorage {
            uint256 value;
        }
        """
        
        name = self.generator.extract_name_from_code(code, "solidity")
        assert name == "SimpleStorage"
    
    def test_extract_name_from_python_class(self):
        """Test extracting name from Python class"""
        code = """
        class UserManager:
            def __init__(self):
                self.users = []
        """
        
        name = self.generator.extract_name_from_code(code, "python")
        assert name == "UserManager"
    
    def test_extract_name_from_python_function(self):
        """Test extracting name from Python function"""
        code = """
        def calculate_total(items):
            return sum(item.price for item in items)
        """
        
        name = self.generator.extract_name_from_code(code, "python")
        assert name == "calculate_total"
    
    def test_fallback_to_default_name(self):
        """Test fallback to default name when no name can be extracted"""
        code = """
        # Just some comments
        x = 10
        y = 20
        """
        
        name = self.generator.extract_name_from_code(code, "python")
        assert name == "script"  # Default for Python
    
    def test_generate_project_name_from_prompt(self):
        """Test generating project name from prompt"""
        prompt = "Create a simple storage contract"
        language = "solidity"
        
        # Mock datetime to get consistent output
        with patch('datetime.datetime') as mock_datetime:
            mock_datetime.now.return_value = datetime(2023, 1, 1, 12, 0, 0)
            project_name = self.generator.generate_project_name(prompt, language)
            
            assert project_name.startswith("create_a_simple_solidity_")
    
    def test_generate_project_name_without_prompt(self):
        """Test generating project name without prompt"""
        language = "javascript"
        
        # Mock datetime to get consistent output
        with patch('datetime.datetime') as mock_datetime:
            mock_datetime.now.return_value = datetime(2023, 1, 1, 12, 0, 0)
            project_name = self.generator.generate_project_name(None, language)
            
            assert project_name.startswith("javascript_project_")

class TestCodeFileHandler:
    """Tests for the CodeFileHandler class"""
    
    def setup_method(self):
        self.test_dir = TEST_DIR
    
    def test_create_file_for_solidity_code(self, setup_test_dir):
        """Test creating a file for Solidity code"""
        handler = CodeFileHandler(base_dir=str(setup_test_dir))
        
        code = """
        pragma solidity ^0.8.0;
        
        contract SimpleStorage {
            uint256 value;
            
            function set(uint256 _value) public {
                value = _value;
            }
            
            function get() public view returns (uint256) {
                return value;
            }
        }
        """
        
        prompt = "Create a simple storage contract"
        
        # Create the file
        result = handler.create_file_for_code(code, prompt)
        
        # Check result
        assert result['status'] == 'success'
        assert 'SimpleStorage.sol' in result['file_path']
        assert result['language'] == 'solidity'
        
        # Check that the file exists and contains the code
        file_path = Path(result['file_path'])
        assert file_path.exists()
        assert file_path.read_text() == code
        
        # Check that README.md was created
        readme_path = Path(result['readme_path'])
        assert readme_path.exists()
        readme_content = readme_path.read_text()
        assert "SimpleStorage" in readme_content
        assert "solidity" in readme_content
        assert prompt in readme_content
    
    def test_create_file_for_markdown_with_code_blocks(self, setup_test_dir):
        """Test creating files from markdown with code blocks"""
        handler = CodeFileHandler(base_dir=str(setup_test_dir))
        
        markdown = """
        # Smart Contract Example
        
        Here's a simple storage contract:
        
        ```solidity
        pragma solidity ^0.8.0;
        
        contract SimpleStorage {
            uint256 value;
            
            function set(uint256 _value) public {
                value = _value;
            }
            
            function get() public view returns (uint256) {
                return value;
            }
        }
        ```
        
        And here's a JavaScript example:
        
        ```javascript
        function calculateTotal(items) {
            return items.reduce((total, item) => total + item.price, 0);
        }
        ```
        """
        
        # Create the files
        result = handler.create_file_for_code(markdown)
        
        # Check result
        assert result['status'] == 'success'
        assert len(result['files']) == 2
        
        # Check first file (Solidity)
        solidity_file = next((f for f in result['files'] if f['language'] == 'solidity'), None)
        assert solidity_file is not None
        assert 'SimpleStorage.sol' in solidity_file['file_path']
        
        # Check second file (JavaScript)
        js_file = next((f for f in result['files'] if f['language'] == 'javascript'), None)
        assert js_file is not None
        assert 'calculateTotal.js' in js_file['file_path'] or 'script.js' in js_file['file_path']
    
    def test_create_project_manually(self, setup_test_dir):
        """Test creating a project manually"""
        handler = CodeFileHandler(base_dir=str(setup_test_dir))
        
        project_name = "TestProject"
        description = "This is a test project"
        
        # Create the project
        result = handler.create_project_manually(project_name, description)
        
        # Check result
        assert result['status'] == 'success'
        assert 'TestProject' in result['dir_path']
        
        # Check that the directory exists
        dir_path = Path(result['dir_path'])
        assert dir_path.exists()
        assert dir_path.is_dir()
        
        # Check that README.md was created
        readme_path = Path(result['readme_path'])
        assert readme_path.exists()
        readme_content = readme_path.read_text()
        assert project_name in readme_content
        assert description in readme_content
        assert "No files yet" in readme_content
    
    def test_add_file_to_project(self, setup_test_dir):
        """Test adding a file to an existing project"""
        handler = CodeFileHandler(base_dir=str(setup_test_dir))
        
        # First create a project
        project_result = handler.create_project_manually("TestProject")
        project_path = project_result['dir_path']
        
        # Now add a file to it
        file_name = "test.js"
        content = "function test() { return 42; }"
        
        file_result = handler.add_file_to_project(project_path, file_name, content)
        
        # Check result
        assert file_result['status'] == 'success'
        assert file_result['language'] == 'javascript'
        
        # Check that the file exists and contains the content
        file_path = Path(file_result['file_path'])
        assert file_path.exists()
        assert file_path.read_text() == content
        
        # Check that README.md was updated
        readme_path = Path(project_path) / "README.md"
        readme_content = readme_path.read_text()
        assert file_name in readme_content
        assert "No files yet" not in readme_content
    
    def test_list_projects(self, setup_test_dir):
        """Test listing projects"""
        handler = CodeFileHandler(base_dir=str(setup_test_dir))
        
        # Create a few projects
        handler.create_project_manually("Project1", "First project")
        handler.create_project_manually("Project2", "Second project")
        
        # List projects
        projects = handler.list_projects()
        
        # Check results
        assert len(projects) == 2
        assert any(p['name'].startswith('Project1') for p in projects)
        assert any(p['name'].startswith('Project2') for p in projects)
        
        # Check that descriptions are included
        project1 = next((p for p in projects if p['name'].startswith('Project1')), None)
        assert project1 is not None
        assert project1['description'] == "First project"
        
        # Check file counts
        assert project1['file_count'] == 0
        
        # Add a file to Project1
        project1_path = project1['path']
        handler.add_file_to_project(project1_path, "test.js", "// Test file")
        
        # List projects again
        updated_projects = handler.list_projects()
        updated_project1 = next((p for p in updated_projects if p['name'].startswith('Project1')), None)
        
        # Check that file count was updated
        assert updated_project1['file_count'] == 1

def test_integration_workflow(setup_test_dir):
    """Test the complete workflow from code generation to file listing"""
    handler = CodeFileHandler(base_dir=str(setup_test_dir))
    
    # 1. Generate a Solidity contract
    solidity_code = """
    pragma solidity ^0.8.0;
    
    contract TokenContract {
        string public name;
        string public symbol;
        uint8 public decimals;
        uint256 public totalSupply;
        
        mapping(address => uint256) public balanceOf;
        
        constructor(string memory _name, string memory _symbol, uint8 _decimals, uint256 _totalSupply) {
            name = _name;
            symbol = _symbol;
            decimals = _decimals;
            totalSupply = _totalSupply;
            balanceOf[msg.sender] = _totalSupply;
        }
        
        function transfer(address _to, uint256 _value) public returns (bool success) {
            require(balanceOf[msg.sender] >= _value, "Insufficient balance");
            balanceOf[msg.sender] -= _value;
            balanceOf[_to] += _value;
            return true;
        }
    }
    """
    
    prompt = "Create an ERC20 token contract"
    
    # Create the file
    result = handler.create_file_for_code(solidity_code, prompt)
    
    # Check result
    assert result['status'] == 'success'
    assert 'TokenContract.sol' in result['file_path']
    
    # 2. Create a manual project
    project_result = handler.create_project_manually("ManualProject", "A manually created project")
    project_path = project_result['dir_path']
    
    # 3. Add a file to the manual project
    js_code = """
    function calculateTokenValue(amount, price) {
        return amount * price;
    }
    
    module.exports = { calculateTokenValue };
    """
    
    file_result = handler.add_file_to_project(project_path, "tokenUtils.js", js_code)
    
    # Check file was added
    assert file_result['status'] == 'success'
    
    # 4. List all projects
    projects = handler.list_projects()
    
    # Check we have both projects
    assert len(projects) >= 2
    
    # Find our projects
    # Find our projects
    token_project = next((p for p in projects if 'TokenContract' in p['path']), None)
    manual_project = next((p for p in projects if 'ManualProject' in p['name']), None)
    
    # Check both projects exist
    assert token_project is not None
    assert manual_project is not None
    
    # Check file counts
    assert token_project['file_count'] >= 1  # Should have at least the .sol file
    assert manual_project['file_count'] == 1  # Should have the .js file we added
    
    # 5. Test handling of Solidity code with markdown formatting
    markdown_solidity = """
    # Voting Contract
    
    A simple voting contract in Solidity:
    
    ```solidity
    pragma solidity ^0.8.0;
    
    contract Voting {
        mapping(address => bool) public hasVoted;
        mapping(bytes32 => uint256) public voteCount;
        
        function vote(bytes32 candidate) public {
            require(!hasVoted[msg.sender], "Already voted");
            hasVoted[msg.sender] = true;
            voteCount[candidate] += 1;
        }
        
        function getVotes(bytes32 candidate) public view returns (uint256) {
            return voteCount[candidate];
        }
    }
    ```
    """
    
    # Create the file
    markdown_result = handler.create_file_for_code(markdown_solidity, "Create a voting contract")
    
    # Check result
    assert markdown_result['status'] == 'success'
    
    # If it found the code block, it should have created a Solidity file
    if 'files' in markdown_result:
        solidity_file = next((f for f in markdown_result['files'] if f['language'] == 'solidity'), None)
        assert solidity_file is not None
        assert 'Voting.sol' in solidity_file['file_path']
    else:
        # If it treated the whole content as one file, check it detected Solidity
        assert markdown_result['language'] == 'solidity'
        assert 'Voting.sol' in markdown_result['file_path']

def test_error_handling(setup_test_dir):
    """Test error handling in the CodeFileHandler"""
    handler = CodeFileHandler(base_dir=str(setup_test_dir))
    
    # Test with invalid project path
    result = handler.add_file_to_project("/nonexistent/path", "test.js", "// content")
    assert result['status'] == 'error'
    assert 'not found' in result['error']
    
    # Test with empty code content
    result = handler.create_file_for_code("")
    assert result['status'] in ['error', 'fallback']
    
    # Test with invalid base directory (make it a file instead of a directory)
    invalid_path = setup_test_dir / "not_a_directory"
    with open(invalid_path, 'w') as f:
        f.write("This is a file, not a directory")
    
    with pytest.raises(Exception):
        CodeFileHandler(base_dir=str(invalid_path))

def test_special_cases(setup_test_dir):
    """Test special cases and edge conditions"""
    handler = CodeFileHandler(base_dir=str(setup_test_dir))
    
    # Test with code that has no clear language indicators
    ambiguous_code = """
    x = 10
    y = 20
    result = x + y
    """
    
    result = handler.create_file_for_code(ambiguous_code)
    assert result['status'] == 'success'
    
    # Test with very long prompt
    long_prompt = "Create " + "a " * 100 + "contract"
    result = handler.create_file_for_code("contract Test {}", long_prompt)
    assert result['status'] == 'success'
    
    # Test with special characters in project name
    special_name = "Test@Project#123"
    result = handler.create_project_manually(special_name)
    assert result['status'] == 'success'
    assert "Test_Project_123" in result['project_name'] or re.sub(r'[^a-zA-Z0-9_-]', '_', special_name) in result['project_name']
    
    # Test with multiple code blocks of the same language
    multi_block = """
    First JavaScript function:
    ```javascript
    function add(a, b) {
        return a + b;
    }
    ```
    
    Second JavaScript function:
    ```javascript
    function subtract(a, b) {
        return a - b;
    }
    ```
    """
    
    result = handler.create_file_for_code(multi_block)
    assert result['status'] == 'success'
    assert len(result['files']) == 2
    
    # Both should be JavaScript files
    assert all(f['language'] == 'javascript' for f in result['files'])

def test_real_world_examples(setup_test_dir):
    """Test with real-world code examples"""
    handler = CodeFileHandler(base_dir=str(setup_test_dir))
    
    # Real Solidity contract example
    solidity_example = """
    // SPDX-License-Identifier: MIT
    pragma solidity ^0.8.0;
    
    import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
    import "@openzeppelin/contracts/access/Ownable.sol";
    
    contract MyToken is ERC20, Ownable {
        constructor(uint256 initialSupply) ERC20("MyToken", "MTK") {
            _mint(msg.sender, initialSupply);
        }
        
        function mint(address to, uint256 amount) public onlyOwner {
            _mint(to, amount);
        }
    }
    """
    
    result = handler.create_file_for_code(solidity_example, "Create an ERC20 token")
    assert result['status'] == 'success'
    assert result['language'] == 'solidity'
    assert 'MyToken.sol' in result['file_path']
    
    # Real Python example
    python_example = """
    import pandas as pd
    import numpy as np
    from sklearn.model_selection import train_test_split
    from sklearn.linear_model import LinearRegression
    
    class PredictionModel:
        def __init__(self):
            self.model = LinearRegression()
            
        def train(self, X, y):
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)
            self.model.fit(X_train, y_train)
            return self.model.score(X_test, y_test)
            
        def predict(self, X):
            return self.model.predict(X)
    """
    
    result = handler.create_file_for_code(python_example, "Create a machine learning model")
    assert result['status'] == 'success'
    assert result['language'] == 'python'
    assert 'PredictionModel.py' in result['file_path']
    
    # Real JavaScript/React example
    react_example = """
    import React, { useState, useEffect } from 'react';
    
    function DataFetcher({ url }) {
        const [data, setData] = useState(null);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState(null);
        
        useEffect(() => {
            async function fetchData() {
                try {
                    setLoading(true);
                    const response = await fetch(url);
                    if (!response.ok) {
                        throw new Error(`HTTP error ${response.status}`);
                    }
                    const json = await response.json();
                    setData(json);
                    setError(null);
                } catch (err) {
                    setError(err.message);
                    setData(null);
                } finally {
                    setLoading(false);
                }
            }
            
            fetchData();
        }, [url]);
        
        return (
            <div>
                {loading && <p>Loading...</p>}
                {error && <p>Error: {error}</p>}
                {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
            </div>
        );
    }
    
    export default DataFetcher;
    """
    
    result = handler.create_file_for_code(react_example, "Create a React data fetcher component")
    assert result['status'] == 'success'
    assert result['language'] in ['javascript', 'react']
    assert 'DataFetcher' in result['file_path']