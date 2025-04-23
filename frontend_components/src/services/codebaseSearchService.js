/**
 * CodebaseSearchService
 * 
 * Provides deep search capabilities for the codebase
 * Helps AI understand project structure and find relevant files
 */
class CodebaseSearchService {
  constructor() {
    this.fileCache = new Map();
    this.projectStructure = null;
    this.lastRefreshTime = null;
    this.refreshInterval = 5 * 60 * 1000; // 5 minutes
  }
  
  /**
   * Get the current workspace structure
   * @returns {Promise<Object>} Workspace structure
   */
  async getWorkspaceStructure() {
    await this.refreshIfNeeded();
    return this.projectStructure;
  }
  
  /**
   * Refresh the file cache and project structure if needed
   * @returns {Promise<void>}
   */
  async refreshIfNeeded() {
    const now = Date.now();
    if (!this.lastRefreshTime || now - this.lastRefreshTime > this.refreshInterval) {
      await this.refreshCache();
    }
  }
  
  /**
   * Refresh the file cache and project structure
   * @returns {Promise<void>}
   */
  async refreshCache() {
    try {
      // Get all files from the API
      const files = await apiService.getFiles();
      
      // Build project structure
      this.projectStructure = {
        type: 'root',
        name: '.Repositories',
        children: files,
        path: '.'
      };
      
      // Cache file contents
      this.cacheFileContents(files);
      
      this.lastRefreshTime = Date.now();
    } catch (error) {
      console.error('Error refreshing codebase cache:', error);
    }
  }
  
  /**
   * Cache file contents recursively
   * @param {Array} files - Files to cache
   * @param {string} parentPath - Parent path
   */
  cacheFileContents(files, parentPath = '') {
    for (const file of files) {
      const filePath = parentPath ? `${parentPath}/${file.name}` : file.name;
      
      if (file.type === 'file') {
        this.fileCache.set(filePath, {
          content: file.content,
          language: file.language,
          lastModified: file.lastModified || Date.now()
        });
      } else if (file.type === 'folder' && file.children) {
        this.cacheFileContents(file.children, filePath);
      }
    }
  }
  
  /**
   * Find files by name pattern
   * @param {string} pattern - Name pattern to search for
   * @returns {Array} Matching files
   */
  findFilesByName(pattern) {
    const regex = new RegExp(pattern, 'i');
    const results = [];
    
    for (const [path, fileInfo] of this.fileCache.entries()) {
      if (regex.test(path)) {
        results.push({
          path,
          ...fileInfo
        });
      }
    }
    
    return results;
  }
  
  /**
   * Find files by content pattern
   * @param {string} pattern - Content pattern to search for
   * @returns {Array} Matching files
   */
  findFilesByContent(pattern) {
    const regex = new RegExp(pattern, 'i');
    const results = [];
    
    for (const [path, fileInfo] of this.fileCache.entries()) {
      if (fileInfo.content && regex.test(fileInfo.content)) {
        results.push({
          path,
          ...fileInfo,
          matches: this.extractContentMatches(fileInfo.content, regex)
        });
      }
    }
    
    return results;
  }
  
  /**
   * Extract content matches with line numbers
   * @param {string} content - File content
   * @param {RegExp} regex - Regex pattern
   * @returns {Array} Matches with line numbers
   */
  extractContentMatches(content, regex) {
    const lines = content.split('\n');
    const matches = [];
    
    for (let i = 0; i < lines.length; i++) {
      if (regex.test(lines[i])) {
        matches.push({
          line: i + 1,
          text: lines[i].trim()
        });
      }
    }
    
    return matches;
  }
  
  /**
   * Find the active workspace based on current context
   * @param {string} context - Current context (e.g., file path, command)
   * @returns {Object|null} Active workspace or null if not found
   */
  findActiveWorkspace(context) {
    if (!this.projectStructure || !this.projectStructure.children) {
      return null;
    }
    
    // Check if context contains a path
    const pathMatch = context.match(/[\/\\]?([a-zA-Z0-9_-]+)[\/\\]/);
    if (pathMatch) {
      const potentialWorkspace = pathMatch[1];
      
      // Look for matching workspace
      for (const project of this.projectStructure.children) {
        if (project.type === 'folder' && 
            (project.name === potentialWorkspace || 
             project.name.startsWith(potentialWorkspace + '_'))) {
          return {
            name: project.name,
            path: project.path,
            type: 'project'
          };
        }
      }
    }
    
    // If no match found, return the most recently modified project
    let mostRecent = null;
    let mostRecentTime = 0;
    
    for (const project of this.projectStructure.children) {
      if (project.type === 'folder') {
        // Check if it has a workspace.json file
        const hasWorkspaceFile = project.children && 
          project.children.some(file => file.name === 'workspace.json');
        
        if (hasWorkspaceFile) {
          const modTime = new Date(project.lastModified || 0).getTime();
          if (modTime > mostRecentTime) {
            mostRecentTime = modTime;
            mostRecent = {
              name: project.name,
              path: project.path,
              type: 'project'
            };
          }
        }
      }
    }
    
    return mostRecent;
  }







  /**
   * Set the active workspace explicitly
   * @param {Object} workspace - The workspace to set as active
   * @returns {Promise<void>}
   */
  async setActiveWorkspace(workspace) {
    try {
      // Call the API to set the active workspace
      await apiService.setActiveWorkspace(workspace.path);
      
      // Store the active workspace locally
      this.activeWorkspace = workspace;
      
      // Store in localStorage for persistence
      localStorage.setItem('activeWorkspace', JSON.stringify(workspace));
      
      // Refresh the cache to reflect the new workspace
      await this.refreshCache();
      
      return workspace;
    } catch (error) {
      console.error('Error setting active workspace:', error);
      throw error;
    }
  }

  /**
   * Get the current active workspace
   * @returns {Object|null} The active workspace or null if none is set
   */
  getActiveWorkspace() {
    // If we have an active workspace in memory, return it
    if (this.activeWorkspace) {
      return this.activeWorkspace;
    }
    
    // Try to load from localStorage
    const savedWorkspace = localStorage.getItem('activeWorkspace');
    if (savedWorkspace) {
      try {
        this.activeWorkspace = JSON.parse(savedWorkspace);
        return this.activeWorkspace;
      } catch (error) {
        console.error('Error parsing saved workspace:', error);
      }
    }
    
    // If no active workspace is set, return null
    return null;
  }

  /**
   * Load the active workspace from the server
   * @returns {Promise<Object|null>} The active workspace or null if none is set
   */
  async loadActiveWorkspace() {
    try {
      // First check if we have it in memory or localStorage
      const localWorkspace = this.getActiveWorkspace();
      if (localWorkspace) {
        return localWorkspace;
      }
      
      // If not, try to get it from the server
      const response = await apiService.getActiveWorkspace();
      if (response.status === 'success' && response.workspace) {
        this.activeWorkspace = response.workspace;
        localStorage.setItem('activeWorkspace', JSON.stringify(response.workspace));
        return this.activeWorkspace;
      }
      
      return null;
    } catch (error) {
      console.error('Error loading active workspace:', error);
      return null;
    }
  }

  /**
   * Clear the active workspace
   * @returns {Promise<void>}
   */
  async clearActiveWorkspace() {
    try {
      // Call the API to clear the active workspace
      await apiService.setActiveWorkspace(null);
      
      // Clear the local storage and memory
      localStorage.removeItem('activeWorkspace');
      this.activeWorkspace = null;
      
      return null;
    } catch (error) {
      console.error('Error clearing active workspace:', error);
      throw error;
    }
  }
}

// Create a singleton instance
const codebaseSearchService = new CodebaseSearchService();

export default codebaseSearchService;