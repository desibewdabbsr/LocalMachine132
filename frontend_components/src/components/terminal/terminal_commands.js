import apiService from '../../services/apiService';
import appConfig from '../../config/appConfig';

/**
 * Terminal Commands Library
 * 
 * This module provides command execution functionality for the terminal component.
 * It includes built-in commands and handles execution of system commands via the API.
 */

// List of built-in commands
const builtInCommands = {
  help: {
    description: 'Display available commands',
    execute: () => {
      const commandList = Object.keys(builtInCommands).map(cmd => 
        `${cmd.padEnd(15)} - ${builtInCommands[cmd].description}`
      ).join('\n');
      
      return `Available commands:\n\n${commandList}\n\nSystem commands are also supported (ls, cat, grep, etc.)`;
    }
  },
  clear: {
    description: 'Clear the terminal',
    execute: () => null // Special handling in the component
  },
  version: {
    description: 'Display application version',
    execute: () => `${appConfig.appName} v${appConfig.version}`
  },
  status: {
    description: 'Check system status',
    execute: async () => {
      try {
        const response = await apiService.getStatus();
        return `System Status: ${response.status || 'Unknown'}\nBackend: ${response.backend || 'Unknown'}\nAI Models: ${response.models?.join(', ') || 'None available'}`;
      } catch (error) {
        throw new Error(`Failed to get status: ${error.message}`);
      }
    }
  },
  ls: {
    description: 'List files in current directory',
    execute: async (args = '') => {
      return await executeSystemCommand(`ls ${args}`);
    }
  },
  cat: {
    description: 'Display file contents',
    execute: async (args = '') => {
      if (!args) return 'Usage: cat <filename>';
      return await executeSystemCommand(`cat ${args}`);
    }
  },
  pwd: {
    description: 'Print working directory',
    execute: async () => {
      return await executeSystemCommand('pwd');
    }
  },
  echo: {
    description: 'Display a line of text',
    execute: async (args = '') => {
      return await executeSystemCommand(`echo ${args}`);
    }
  },
  grep: {
    description: 'Search for patterns in files',
    execute: async (args = '') => {
      if (!args) return 'Usage: grep <pattern> <filename>';
      return await executeSystemCommand(`grep ${args}`);
    }
  },
  find: {
    description: 'Search for files',
    execute: async (args = '') => {
      if (!args) return 'Usage: find <path> <options>';
      return await executeSystemCommand(`find ${args}`);
    }
  }
};

/**
 * Execute a system command via the API
 * @param {string} command - The command to execute
 * @returns {Promise<string>} Command output
 */
async function executeSystemCommand(command) {
  try {
    const response = await apiService.executeCommand(command);
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response.output || 'Command executed successfully';
  } catch (error) {
    throw new Error(`Command execution failed: ${error.message}`);
  }
}

/**
 * Parse a command string into command and arguments
 * @param {string} commandString - The full command string
 * @returns {Object} Object containing command and args
 */
function parseCommand(commandString) {
  const parts = commandString.trim().split(/\s+/);
  const command = parts[0].toLowerCase();
  const args = parts.slice(1).join(' ');
  
  return { command, args };
}

/**
 * Execute a terminal command
 * @param {string} commandString - The command string to execute
 * @returns {Promise<Object>} Result object with type and content
 */
export async function executeCommand(commandString) {
  if (!commandString.trim()) {
    return null;
  }
  
  const { command, args } = parseCommand(commandString);
  
  // Handle built-in commands
  if (command in builtInCommands) {
    if (command === 'clear') {
      return { type: 'clear' };
    }
    
    try {
      const output = await builtInCommands[command].execute(args);
      return { type: 'output', content: output };
    } catch (error) {
      return { type: 'error', content: error.message };
    }
  }
  
  // Handle system commands
  try {
    const output = await executeSystemCommand(commandString);
    return { type: 'output', content: output };
  } catch (error) {
    return { type: 'error', content: error.message };
  }
}

/**
 * Get list of available commands
 * @returns {Array} Array of command objects with name and description
 */
export function getAvailableCommands() {
  return Object.keys(builtInCommands).map(name => ({
    name,
    description: builtInCommands[name].description
  }));
}