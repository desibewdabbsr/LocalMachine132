from pathlib import Path
import subprocess
import platform
from typing import Dict, List, Optional, Any
from tqdm import tqdm
from utils.logger import AdvancedLogger

class SystemDependencyManager:
    def __init__(self):
        self.logger = AdvancedLogger().get_logger("SystemDependencyManager")
        self.system = platform.system().lower()
        self.package_managers = {
            "linux": self._get_linux_package_manager(),
            "darwin": "brew",
            "windows": "choco"
        }
        
    # def _get_linux_package_manager(self) -> str:
    #     """Detect Linux package manager"""
    #     if subprocess.run(["which", "apt"], capture_output=True).returncode == 0:
    #         return "apt"
    #     elif subprocess.run(["which", "dnf"], capture_output=True).returncode == 0:
    #         return "dnf"
    #     elif subprocess.run(["which", "pacman"], capture_output=True).returncode == 0:
    #         return "pacman"
    #     else:
    #         raise RuntimeError("No supported package manager found")

    def _get_linux_package_manager(self) -> str:
        """Detect Linux package manager"""
        # Add Pop!_OS specific paths
        package_managers = {
            "/usr/bin/apt": "apt",
            "/usr/bin/apt-get": "apt",
            "/usr/bin/pop-upgrade": "apt",
            "/usr/bin/dpkg": "apt",
            "/usr/bin/dnf": "dnf",
            "/usr/bin/pacman": "pacman"
        }
        
        # First check Pop!_OS specific tools
        if Path("/etc/pop-os/release").exists():
            return "apt"
            
        for pm_path, pm_type in package_managers.items():
            if Path(pm_path).exists():
                return pm_type
                
        return "apt"  # Default for Pop!_OS/Ubuntu based systems



    def install_dependencies(self, dependencies: List[str], config: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Install system dependencies"""
        self.logger.info(f"Installing system dependencies: {dependencies}")
        
        results = {}
        with tqdm(total=len(dependencies), desc="Installing Dependencies") as pbar:
            for dep in dependencies:
                try:
                    result = self._install_dependency(dep, config)
                    results[dep] = result
                    pbar.update(1)
                except Exception as e:
                    self.logger.error(f"Failed to install {dep}: {str(e)}")
                    raise
                
        return results

    def _install_dependency(self, dependency: str, config: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Install individual dependency"""
        package_manager = self.package_managers.get(self.system)
        if not package_manager:
            raise RuntimeError(f"Unsupported system: {self.system}")
            
        cmd: List[str] = []  # Initialize cmd as empty list
        try:
            if package_manager == "apt":
                cmd = ["apt-get", "install", "-y", dependency]
            elif package_manager == "dnf":
                cmd = ["dnf", "install", "-y", dependency]
            elif package_manager == "pacman":
                cmd = ["pacman", "-S", "--noconfirm", dependency]
            elif package_manager == "brew":
                cmd = ["brew", "install", dependency]
            elif package_manager == "choco":
                cmd = ["choco", "install", "-y", dependency]
                
            result = subprocess.run(
                cmd,
                check=True,
                capture_output=True,
                text=True
            )
            
            return {
                "status": "installed",
                "version": self._get_dependency_version(dependency),
                "output": result.stdout
            }
            
        except subprocess.CalledProcessError as e:
            self.logger.error(f"Installation failed: {e.stderr}")
            raise


    def _get_dependency_version(self, dependency: str) -> str:
        """Get installed dependency version"""
        try:
            result = subprocess.run(
                [dependency, "--version"],
                capture_output=True,
                text=True
            )
            return result.stdout.strip()
        except:
            return "version unknown"

    def verify_dependencies(self, dependencies: List[str]) -> Dict[str, bool]:
        """Verify installed dependencies"""
        self.logger.info("Verifying dependencies")
        
        results = {}
        with tqdm(total=len(dependencies), desc="Verifying Dependencies") as pbar:
            for dep in dependencies:
                try:
                    subprocess.run(
                        ["which", dep],
                        check=True,
                        capture_output=True
                    )
                    results[dep] = True
                except subprocess.CalledProcessError:
                    results[dep] = False
                pbar.update(1)
                
        return results


    def cleanup_dependencies(self, dependencies: List[str]) -> Dict[str, Any]:
        """Clean up installed dependencies"""
        self.logger.info("Cleaning up dependencies")
        
        results = {}
        package_manager = self.package_managers.get(self.system)
        
        with tqdm(total=len(dependencies), desc="Cleaning Dependencies") as pbar:
            for dep in dependencies:
                cmd: List[str] = []  # Initialize cmd as empty list
                try:
                    if package_manager == "apt":
                        cmd = ["apt-get", "remove", "-y", dep]
                    elif package_manager == "dnf":
                        cmd = ["dnf", "remove", "-y", dep]
                    elif package_manager == "pacman":
                        cmd = ["pacman", "-R", "--noconfirm", dep]
                    elif package_manager == "brew":
                        cmd = ["brew", "uninstall", dep]
                    elif package_manager == "choco":
                        cmd = ["choco", "uninstall", "-y", dep]
                        
                    subprocess.run(cmd, check=True, capture_output=True)
                    results[dep] = "removed"
                except Exception as e:
                    self.logger.error(f"Failed to remove {dep}: {str(e)}")
                    results[dep] = "failed"
                pbar.update(1)
                
        return results