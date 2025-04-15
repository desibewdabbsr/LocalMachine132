from pathlib import Path
import shutil
import os
from typing import List, Optional
from tqdm import tqdm
from utils.logger import AdvancedLogger

class FileOperations:
    def __init__(self):
        self.logger = AdvancedLogger().get_logger("FileOperations")
        
    @AdvancedLogger().performance_monitor("FileOperations")    
    def create_directory_structure(self, base_path: Path, structure: List[str]) -> None:
        """Create directory structure with progress tracking"""
        self.logger.info(f"Creating directory structure at: {base_path}")
        
        # Test write permissions first
        if not os.access(base_path, os.W_OK):
            self.logger.error(f"Permission denied: Cannot write to {base_path}")
            raise PermissionError(f"Cannot create directory in {base_path}")
            
        with tqdm(total=len(structure), desc="Creating directories") as pbar:
            for dir_path in structure:
                try:
                    full_path = base_path / dir_path
                    full_path.mkdir(parents=True, exist_ok=True)
                    self.logger.debug(f"Created directory: {full_path}")
                    pbar.update(1)
                except (PermissionError, OSError) as e:
                    self.logger.error(f"Permission denied: {str(e)}")
                    raise

    def copy_with_progress(self, src: Path, dest: Path) -> None:
        """Copy files with progress tracking"""
        try:
            if src.is_file():
                self._copy_file(src, dest)
            else:
                self._copy_directory(src, dest)
        except Exception as e:
            self.logger.error(f"Copy operation failed: {str(e)}")
            raise

    def _copy_file(self, src: Path, dest: Path) -> None:
        """Copy single file with progress"""
        self.logger.info(f"Copying file: {src} -> {dest}")
        shutil.copy2(src, dest)
        self.logger.debug(f"File copied successfully: {dest}")

    def _copy_directory(self, src: Path, dest: Path) -> None:
        """Copy directory with progress tracking"""
        self.logger.info(f"Copying directory: {src} -> {dest}")
        files = list(src.rglob("*"))
        
        # Create destination directory first
        dest.mkdir(parents=True, exist_ok=True)
        
        # Copy directory structure first
        for item in src.rglob("*"):
            if item.is_dir():
                (dest / item.relative_to(src)).mkdir(parents=True, exist_ok=True)
        
        # Then copy files with progress tracking
        with tqdm(total=len(files), desc="Copying files") as pbar:
            for file in files:
                if file.is_file():
                    rel_path = file.relative_to(src)
                    dest_file = dest / rel_path
                    shutil.copy2(file, dest_file)
                    self.logger.debug(f"Copied: {rel_path}")
                pbar.update(1)

    def safe_delete(self, path: Path) -> None:
        """Safely delete files or directories with confirmation"""
        try:
            if path.exists():
                self.logger.info(f"Deleting: {path}")
                if path.is_file():
                    path.unlink()
                else:
                    shutil.rmtree(path)
                self.logger.info(f"Successfully deleted: {path}")
        except Exception as e:
            self.logger.error(f"Deletion failed for {path}: {str(e)}")
            raise
