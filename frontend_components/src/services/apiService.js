/**
 * API Service
 * Handles communication with the backend API
 */
class ApiService {
  constructor() {
    this.baseUrl = 'http://localhost:5000/api';
    this.socket = null;
  }



  /**
   * Initialize the socket connection
   */
  initSocket() {
    if (!this.socket && typeof io !== 'undefined') {
      console.log('Initializing socket connection...');
      
      // Add connection options for better reliability
      const options = {
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 60000,  // Increased timeout
        transports: ['polling', 'websocket']  // Try polling first, then websocket
      };
      
      this.socket = io('http://localhost:5000', options);
      
      this.socket.on('connect', () => {
        console.log('Socket connected successfully');
        document.dispatchEvent(new CustomEvent('socket-connected'));
      });
      
      this.socket.on('disconnect', () => {
        console.log('Socket disconnected');
        document.dispatchEvent(new CustomEvent('socket-disconnected'));
      });
      
      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        // Try to reconnect after a short delay
        setTimeout(() => {
          if (this.socket) {
            this.socket.connect();
          }
        }, 2000);
      });
      
      this.socket.on('error', (error) => {
        console.error('Socket error:', error);
      });
      
      // Listen for process updates and broadcast them as custom events
      this.socket.on('process_update', (update) => {
        console.log('Process update received:', update);
        document.dispatchEvent(new CustomEvent('process-update', { detail: update }));
      });
    } else if (typeof io === 'undefined') {
      console.error('Socket.io client not available. Make sure it is included in your HTML.');
    }
    
    return this.socket;
  }



  /**
   * Get available AI models
   * @returns {Promise<Array>} List of available models
   */
  async getModels() {
    try {
      const response = await fetch(`${this.baseUrl}/models`);
      const data = await response.json();
      return data.models || [];
    } catch (error) {
      console.error('Error fetching models:', error);
      return [];
    }
  }

  /**
   * Process a message with an AI model
   * @param {string} message - The message to process
   * @param {string} model - The model to use (default: 'auto')
   * @returns {Promise<Object>} The response from the AI
   */
  async processMessage(message, model = 'auto') {
    try {
      console.log(`Processing message with model: ${model}`);
      
      // Add a timeout to the fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await fetch(`${this.baseUrl}/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, model }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Response received:', data);
      
      return {
        content: data.content || data.message || JSON.stringify(data),
        model: data.model || model
      };
    } catch (error) {
      console.error(`Error processing message with ${model}:`, error);
      
      // Check if it's a network error
      if (error.name === 'AbortError') {
        return { error: 'Request timed out. The server took too long to respond.' };
      } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        return { error: 'Network error. Please check if the server is running.' };
      }
      
      return { error: error.message };
    }
  }



    

  /**
   * Generate code with an AI model
   * @param {string} prompt - The code generation prompt
   * @param {string} model - The model to use (default: 'auto')
   * @returns {Promise<Object>} The generated code
   */
  async generateCode(prompt, model = 'auto') {
    try {
      console.log(`Generating code with model: ${model}`);
      
      // Dispatch a process update event
      document.dispatchEvent(new CustomEvent('process-update', {
        detail: {
          type: 'process',
          message: `Starting code generation with ${model}: ${prompt.substring(0, 50)}...`
        }
      }));
      
      // Add a timeout to the fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout for code generation
      
      const response = await fetch(`${this.baseUrl}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, model }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Dispatch a process update event for completion
      document.dispatchEvent(new CustomEvent('process-update', {
        detail: {
          type: 'process',
          message: 'Code generation completed'
        }
      }));
      
      return data;
    } catch (error) {
      console.error(`Error generating code with ${model}:`, error);
      
      // Dispatch an error event
      document.dispatchEvent(new CustomEvent('process-update', {
        detail: {
          type: 'error',
          message: `Error generating code: ${error.message}`
        }
      }));
      
      // Check if it's a network error
      if (error.name === 'AbortError') {
        return { error: 'Request timed out. The server took too long to respond.' };
      } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        return { error: 'Network error. Please check if the server is running.' };
      }
      
      return { error: error.message };
    }
  }



  /**
   * Generate code with socket.io for real-time updates
   * @param {string} prompt - The code generation prompt
   * @param {string} model - The model to use (default: 'auto')
   * @param {Function} onUpdate - Callback for process updates
   * @returns {Promise<Object>} The generated code
   */
  generateCodeWithUpdates(prompt, model = 'auto', onUpdate) {
    return new Promise((resolve, reject) => {
      const socket = this.initSocket();
      
      if (!socket) {
        // Fall back to HTTP API if socket is not available
        this.generateCode(prompt, model)
          .then(resolve)
          .catch(reject);
        return;
      }
      
      // Listen for process updates
      const processUpdateHandler = (update) => {
        if (onUpdate && typeof onUpdate === 'function') {
          onUpdate(update);
        }
      };
      
      socket.on('process_update', processUpdateHandler);
      
      // Listen for code generation completion
      socket.on('code_generated', (data) => {
        socket.off('process_update', processUpdateHandler);
        socket.off('code_generated');
        socket.off('error');
        resolve(data);
      });
      
      // Listen for errors
      socket.on('error', (error) => {
        socket.off('process_update', processUpdateHandler);
        socket.off('code_generated');
        socket.off('error');
        reject(error);
      });
      
      // Send code generation request
      socket.emit('generate_code', { prompt, model });
    });
  }

  /**
   * Get list of generated files
   * @returns {Promise<Array>} List of files
   */
  async getFiles() {
    try {
      const response = await fetch(`${this.baseUrl}/files`);
      const data = await response.json();
      return data.files || [];
    } catch (error) {
      console.error('Error fetching files:', error);
      return [];
    }
  }

  /**
   * Get content of a specific file
   * @param {string} filePath - Path to the file
   * @returns {Promise<Object>} File content
   */
  async getFile(filePath) {
    try {
      const response = await fetch(`${this.baseUrl}/file/${filePath}`);
      return await response.json();
    } catch (error) {
      console.error(`Error fetching file ${filePath}:`, error);
      return { error: error.message };
    }
  }









    /**
   * Start Auto-Pilot with project requirements
   * @param {string} requirements - Project requirements
   * @returns {Promise<Object>} Auto-Pilot status
   */
  async startAutoPilot(requirements) {
    try {
      const response = await fetch(`${this.baseUrl}/autopilot/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requirements }),
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error starting Auto-Pilot:', error);
      return { error: error.message };
    }
  }

  /**
   * Get Auto-Pilot status
   * @returns {Promise<Object>} Auto-Pilot status
   */
  async getAutoPilotStatus() {
    try {
      const response = await fetch(`${this.baseUrl}/autopilot/status`);
      return await response.json();
    } catch (error) {
      console.error('Error getting Auto-Pilot status:', error);
      return { error: error.message };
    }
  }

  /**
   * Process next module in Auto-Pilot
   * @returns {Promise<Object>} Module processing result
   */
  async processNextModule() {
    try {
      const response = await fetch(`${this.baseUrl}/autopilot/next`);
      return await response.json();
    } catch (error) {
      console.error('Error processing next module:', error);
      return { error: error.message };
    }
  }

  /**
   * Pause Auto-Pilot
   * @returns {Promise<Object>} Pause result
   */
  async pauseAutoPilot() {
    try {
      const response = await fetch(`${this.baseUrl}/autopilot/pause`, {
        method: 'POST',
      });
      return await response.json();
    } catch (error) {
      console.error('Error pausing Auto-Pilot:', error);
      return { error: error.message };
    }
  }

  /**
   * Resume Auto-Pilot
   * @returns {Promise<Object>} Resume result
   */
  async resumeAutoPilot() {
    try {
      const response = await fetch(`${this.baseUrl}/autopilot/resume`, {
        method: 'POST',
      });
      return await response.json();
    } catch (error) {
      console.error('Error resuming Auto-Pilot:', error);
      return { error: error.message };
    }
  }
}

// Create a singleton instance
const apiService = new ApiService();

export default apiService;