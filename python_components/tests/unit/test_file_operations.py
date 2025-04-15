import pytest
from pathlib import Path
import shutil
from utils.file_operations import FileOperations

@pytest.fixture
def file_ops():
    return FileOperations()

@pytest.fixture
def test_dir():
    dir_path = Path("test_file_ops")
    dir_path.mkdir(exist_ok=True)
    yield dir_path
    if dir_path.exists():
        shutil.rmtree(dir_path)

def test_directory_creation(file_ops, test_dir):
    structure = ["src/core", "tests/unit", "docs/api"]
    file_ops.create_directory_structure(test_dir, structure)
    
    for dir_path in structure:
        assert (test_dir / dir_path).exists()
        assert (test_dir / dir_path).is_dir()

def test_file_copy(file_ops, test_dir):
    # Create a test file
    source_file = test_dir / "test.txt"
    with open(source_file, "w") as f:
        f.write("test content")
    
    dest_file = test_dir / "copied.txt"
    file_ops.copy_with_progress(source_file, dest_file)
    
    assert dest_file.exists()
    assert dest_file.read_text() == "test content"

def test_directory_copy(file_ops, test_dir):
    # Create test directory structure
    source_dir = test_dir / "source"
    source_dir.mkdir()
    (source_dir / "subdir").mkdir()
    with open(source_dir / "test.txt", "w") as f:
        f.write("test")
    
    dest_dir = test_dir / "dest"
    file_ops.copy_with_progress(source_dir, dest_dir)
    
    assert dest_dir.exists()
    assert (dest_dir / "subdir").exists()
    assert (dest_dir / "test.txt").exists()

def test_safe_delete(file_ops, test_dir):
    test_file = test_dir / "to_delete.txt"
    test_file.touch()
    
    assert test_file.exists()
    file_ops.safe_delete(test_file)
    assert not test_file.exists()

def test_error_handling(file_ops):
    # Create a read-only directory to trigger permission error
    protected_path = Path("read_only_dir")
    protected_path.mkdir(exist_ok=True)
    protected_path.chmod(0o444)  # Set read-only permissions
    
    try:
        with pytest.raises((PermissionError, OSError)):
            file_ops.create_directory_structure(protected_path, ["test"])
    finally:
        # Cleanup: restore permissions and remove directory
        protected_path.chmod(0o777)
        protected_path.rmdir()
