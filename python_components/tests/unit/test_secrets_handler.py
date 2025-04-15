import pytest
from pathlib import Path
import shutil
import yaml
from config.secrets_handler import SecretsHandler

@pytest.fixture
def secrets_handler():
    return SecretsHandler()

@pytest.fixture
def test_project():
    project_path = Path("test_secrets_project")
    project_path.mkdir(exist_ok=True)
    yield project_path
    if project_path.exists():
        shutil.rmtree(project_path)


# Enable for mock 
# def test_secrets_initialization(secrets_handler, test_project):
#     secrets = secrets_handler.initialize_secrets(test_project)
#     assert isinstance(secrets, dict)
#     assert "database" in secrets
#     assert "api_keys" in secrets

def test_encryption_key_generation(secrets_handler, test_project):
    secrets_handler.initialize_secrets(test_project)
    assert secrets_handler.key_file.exists()
    with open(secrets_handler.key_file, 'rb') as f:
        key = f.read()
        assert len(key) > 0

def test_gitignore_update(secrets_handler, test_project):
    secrets_handler.initialize_secrets(test_project)
    gitignore_path = test_project / ".gitignore"
    assert gitignore_path.exists()
    with open(gitignore_path) as f:
        content = f.read()
        assert "config/secrets.yaml" in content
        assert "config/.key" in content


# # Enable for mock
# def test_secrets_file_creation(secrets_handler, test_project):
#     secrets_handler.initialize_secrets(test_project)
#     assert secrets_handler.secrets_file.exists()
#     with open(secrets_handler.secrets_file) as f:
#         secrets = yaml.safe_load(f)
#         assert "database" in secrets
#         assert "username" in secrets["database"]

def test_validation_error(secrets_handler, test_project):
    # Ensure files don't exist before validation
    if secrets_handler.secrets_file.exists():
        secrets_handler.secrets_file.unlink()
    if secrets_handler.key_file.exists():
        secrets_handler.key_file.unlink()
        
    with pytest.raises(FileNotFoundError):
        secrets_handler._validate_setup()

def test_secrets_initialization(secrets_handler, test_project):
    secrets = secrets_handler.initialize_secrets(test_project)
    assert isinstance(secrets, dict)
    assert "database" in secrets
    assert "api_keys" in secrets
    assert "cody" in secrets
    assert "api_token" in secrets["cody"]

def test_secrets_file_creation(secrets_handler: SecretsHandler, test_project: Path):
    secrets = secrets_handler._create_secrets_structure()
    
    assert isinstance(secrets, dict)
    assert "cody" in secrets
    assert isinstance(secrets["cody"], dict)
    assert "api_token" in secrets["cody"]
    assert secrets["cody"]["endpoint"] == "https://sourcegraph.com/.api/graphql"




# pytest tests/unit/test_secrets_handler.py -v