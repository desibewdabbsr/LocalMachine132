/**
 * Holographic File Viewer
 * Displays and manages files in the holographic panel
 */
class HolographicFileViewer {
    constructor(panel) {
        this.panel = panel;
        this.element = null;
        this.initialized = false;
        this.expandedDirs = new Set(); // Track expanded directories
    }
    
    /**
     * Initialize the file viewer
     */
    init() {
        console.log('Initializing holographic file viewer...');
        this.initialized = true;
    }
    
    /**
     * Render the file viewer
     * @returns {HTMLElement} - File viewer element
     */
    render() {
        console.log('Rendering file viewer');
        
        // Create main container
        const container = document.createElement('div');
        container.className = 'file-view-container';
        
        // File explorer sidebar
        const fileSidebar = document.createElement('div');
        fileSidebar.className = 'file-sidebar';
        
        const fileList = document.createElement('div');
        fileList.className = 'file-list';
        
        if (Object.keys(this.panel.files).length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-message';
            emptyMessage.textContent = 'No files created yet';
            fileList.appendChild(emptyMessage);
        } else {
            // Group files by directory
            const filesByDir = this._groupFilesByDirectory();
            
            // Create directory structure
            Object.keys(filesByDir).sort().forEach(dirPath => {
                const dirItem = document.createElement('div');
                dirItem.className = 'directory-item';
                
                const dirName = dirPath === '' ? 'Root' : dirPath;
                
                const dirHeader = document.createElement('div');
                dirHeader.className = 'directory-header';
                dirHeader.innerHTML = `<span class="directory-icon">📁</span> ${dirName}`;
                
                // Toggle directory expansion
                dirHeader.addEventListener('click', () => {
                    if (this.expandedDirs.has(dirPath)) {
                        this.expandedDirs.delete(dirPath);
                    } else {
                        this.expandedDirs.add(dirPath);
                    }
                    this.updateUI();
                });
                
                dirItem.appendChild(dirHeader);
                
                const fileItems = document.createElement('div');
                fileItems.className = 'file-items';
                fileItems.style.display = this.expandedDirs.has(dirPath) ? 'block' : 'none';
                
                filesByDir[dirPath].sort((a, b) => a.name.localeCompare(b.name)).forEach(file => {
                    const fileItem = document.createElement('div');
                    fileItem.className = 'file-item';
                    fileItem.innerHTML = `<span class="file-icon">📄</span> ${file.name}`;
                    
                    if (this.panel.currentFile === file.path) {
                        fileItem.classList.add('active');
                    }
                    
                    fileItem.addEventListener('click', () => {
                        this.panel.currentFile = file.path;
                        this.panel.updateUI();
                    });
                    
                    fileItems.appendChild(fileItem);
                });
                
                dirItem.appendChild(fileItems);
                fileList.appendChild(dirItem);
            });
        }
        
        fileSidebar.appendChild(fileList);
        container.appendChild(fileSidebar);
        
        // File content area
        const fileContent = document.createElement('div');
        fileContent.className = 'file-content-area';
        
        if (this.panel.currentFile && this.panel.files[this.panel.currentFile]) {
            const fileHeader = document.createElement('div');
            fileHeader.className = 'file-header';
            fileHeader.textContent = this.panel.currentFile;
            fileContent.appendChild(fileHeader);
            
            const codeDisplay = document.createElement('pre');
            codeDisplay.className = 'code-display';
            codeDisplay.textContent = this.panel.files[this.panel.currentFile];
            
            // Add copy button
            const copyBtn = document.createElement('button');
            copyBtn.className = 'copy-code-btn';
            copyBtn.textContent = 'Copy';
            copyBtn.title = 'Copy code to clipboard';
            copyBtn.addEventListener('click', () => this._copyToClipboard(this.panel.files[this.panel.currentFile]));
            
            const btnContainer = document.createElement('div');
            btnContainer.className = 'file-actions';
            btnContainer.appendChild(copyBtn);
            
            fileContent.appendChild(btnContainer);
            fileContent.appendChild(codeDisplay);
        } else {
            const noFileMessage = document.createElement('div');
            noFileMessage.className = 'no-file-message';
            noFileMessage.innerHTML = '<span class="icon">📄</span><p>Select a file to view its content</p>';
            fileContent.appendChild(noFileMessage);
        }
        
        container.appendChild(fileContent);
        
        this.element = container;
        return container;
    }
    
    /**
     * Update the UI
     */
    updateUI() {
        if (!this.element) return;
        
        // Re-render the file viewer
        const newElement = this.render();
        if (this.element.parentNode) {
            this.element.parentNode.replaceChild(newElement, this.element);
            this.element = newElement;
        }
    }
    
    /**
     * Group files by directory
     * @returns {Object} - Files grouped by directory
     */
    _groupFilesByDirectory() {
        const filesByDir = {};
        
        Object.keys(this.panel.files).forEach(path => {
            const parts = path.split('/');
            const fileName = parts.pop();
            const dirPath = parts.join('/');
            
            if (!filesByDir[dirPath]) {
                filesByDir[dirPath] = [];
            }
            
            filesByDir[dirPath].push({
                name: fileName,
                path: path
            });
        });
        
        return filesByDir;
    }
    
    /**
     * Copy text to clipboard
     * @param {string} text - Text to copy
     */
    _copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            // Show a temporary success message
            const copyBtn = this.element.querySelector('.copy-code-btn');
            if (copyBtn) {
                const originalText = copyBtn.textContent;
                copyBtn.textContent = 'Copied!';
                setTimeout(() => {
                    copyBtn.textContent = originalText;
                }, 2000);
            }
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    }

    /**
     * Get file extension
     * @param {string} filename - Filename
     * @returns {string} - File extension
     */
    _getFileExtension(filename) {
        // Use the utility function if available, otherwise fallback to local implementation
        if (window.FileViewerUtils) {
            return window.FileViewerUtils.getFileExtension(filename);
        }

        // Fallback implementation with null check
        if (!filename) return '';
        return filename.split('.').pop().toLowerCase();
    }


    /**
     * Initialize the file viewer
     * @param {HTMLElement} container - Optional container to mount the viewer
     */
    init(container = null) {
        console.log('Initializing holographic file viewer...');

        // Create the initial element if it doesn't exist
        if (!this.element) {
            this.element = this.render();
        }

        // If a container is provided, mount the element
        if (container) {
            // Clear the container first
            container.innerHTML = '';
            container.appendChild(this.element);
            
            // Verify the element is in the DOM
            if (document.body.contains(this.element)) {
                console.log('File viewer element successfully connected to DOM');
            } else {
                console.warn('File viewer element not connected to DOM after initialization');
            }
        }

        // Only call refreshProjects if it exists
        if (typeof this.refreshProjects === 'function') {
            this.refreshProjects();
        } else {
            console.log('refreshProjects method not available in this implementation');
        }

        this.initialized = true;

        return this.element;
    }



    /**
     * Get file icon based on extension
     * @param {string} filename - Filename
     * @returns {string} - Icon character
     */
    _getFileIcon(filename) {
        const ext = this._getFileExtension(filename);
        
        switch (ext) {
            case 'js':
                return '📜'; // JavaScript
            case 'html':
            case 'htm':
                return '🌐'; // HTML
            case 'css':
                return '🎨'; // CSS
            case 'json':
                return '📋'; // JSON
            case 'py':
                return '🐍'; // Python
            case 'md':
                return '📝'; // Markdown
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
            case 'svg':
                return '🖼️'; // Images
            default:
                return '📄'; // Default file
        }
    }
}

// Make the class available globally
window.HolographicFileViewer = HolographicFileViewer;