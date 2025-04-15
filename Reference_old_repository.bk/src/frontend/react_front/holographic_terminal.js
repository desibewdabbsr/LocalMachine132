/**
 * Holographic Terminal Commands
 * Command handling for the terminal interface
 */
class HolographicTerminalCommands {
    constructor(terminal, panel) {
        this.terminal = terminal;
        this.panel = panel;
    }
    
    /**
     * Execute a command
     * @param {string} command - Command to execute
     */
    executeCommand(command) {
        this.terminal.addInput(command);
        
        // Process command
        const trimmedCmd = command.trim();
        
        if (!trimmedCmd) {
            // Empty command, just add a new prompt
            return;
        }
        
        // Split command and arguments
        const parts = trimmedCmd.split(' ');
        const cmd = parts[0].toLowerCase();
        const args = parts.slice(1);
        
        // Process built-in commands
        switch (cmd) {
            case 'help':
                this._showHelp();
                break;
            case 'clear':
                this._clearTerminal();
                break;
            case 'ls':
            case 'dir':
                this._listFiles(args[0]);
                break;
            case 'cat':
            case 'type':
                this._showFile(args[0]);
                break;
            case 'cd':
                this.terminal.addOutput('Directory navigation is simulated in this environment.');
                break;
            case 'echo':
                this.terminal.addOutput(args.join(' '));
                break;
            case 'date':
                this.terminal.addOutput(new Date().toString());
                break;
            case 'whoami':
                this.terminal.addOutput('AI Development Assistant User');
                break;
            default:
                // Try to process with AI
                if (this.panel.socket && this.panel.socket.connected) {
                    this.terminal.addOutput(`Sending command to AI: ${trimmedCmd}`);
                    this.panel.socket.emit('terminal_command', {
                        command: trimmedCmd
                    });
                } else {
                    this.terminal.addOutput(`Command not found: ${cmd}`);
                    this.terminal.addOutput('Type "help" for available commands');
                }
        }
    }
    
    /**
     * Auto-complete command or file name
     * @param {string} input - Current input
     */
    autoComplete(input) {
        const trimmedInput = input.trim();
        
        // If empty, do nothing
        if (!trimmedInput) return;
        
        // Split input into parts
        const parts = trimmedInput.split(' ');
        const lastPart = parts[parts.length - 1];
        
        // If this is the first part, try to complete command
        if (parts.length === 1) {
            const commands = ['help', 'clear', 'ls', 'dir', 'cat', 'type', 'cd', 'echo', 'date', 'whoami'];
            const matches = commands.filter(cmd => cmd.startsWith(lastPart));
            
            if (matches.length === 1) {
                // Single match, complete it
                this.terminal.currentInput = matches[0];
                this.terminal.updateUI();
            } else if (matches.length > 1) {
                // Multiple matches, show options
                this.terminal.addInput(this.terminal.currentInput);
                this.terminal.addOutput('Possible commands:');
                matches.forEach(match => {
                    this.terminal.addOutput(`  ${match}`);
                });
            }
        } else {
            // Try to complete file name
            const files = Object.keys(this.panel.files);
            const matches = files.filter(file => file.includes(lastPart));
            
            if (matches.length === 1) {
                // Single match, complete it
                parts[parts.length - 1] = matches[0];
                this.terminal.currentInput = parts.join(' ');
                this.terminal.updateUI();
            } else if (matches.length > 1) {
                // Multiple matches, show options
                this.terminal.addInput(this.terminal.currentInput);
                this.terminal.addOutput('Possible files:');
                matches.forEach(match => {
                    this.terminal.addOutput(`  ${match}`);
                });
            }
        }
    }
    
    /**
     * Show help
     */
    _showHelp() {
        this.terminal.addOutput('Available commands:');
        this.terminal.addOutput('  help        - Show this help message');
        this.terminal.addOutput('  clear       - Clear the terminal');
        this.terminal.addOutput('  ls [path]   - List files in directory');
        this.terminal.addOutput('  cat <file>  - Show file content');
        this.terminal.addOutput('  echo <text> - Display text');
        this.terminal.addOutput('  date        - Show current date and time');
        this.terminal.addOutput('  whoami      - Show current user');
        this.terminal.addOutput('');
        this.terminal.addOutput('Any other command will be sent to the AI for processing.');
    }
    
    /**
     * Clear terminal
     */
    _clearTerminal() {
        this.terminal.history = [];
        this.terminal.updateUI();
    }
    
    /**
     * List files
     * @param {string} path - Path to list
     */
    _listFiles(path) {
        const files = Object.keys(this.panel.files);
        
        if (files.length === 0) {
            this.terminal.addOutput('No files found.');
            return;
        }
        
        // Filter by path if provided
        const filteredFiles = path 
            ? files.filter(f => f.startsWith(path)) 
            : files;
        
        if (filteredFiles.length === 0) {
            this.terminal.addOutput(`No files found in path: ${path}`);
            return;
        }
        
        this.terminal.addOutput('Files:');
        filteredFiles.forEach(file => {
            this.terminal.addOutput(`  ${file}`);
        });
    }
    
    /**
     * Show file content
     * @param {string} path - File path
     */
    _showFile(path) {
        if (!path) {
            this.terminal.addOutput('Usage: cat <file>');
            return;
        }
        
        // Find the file (exact match or partial match)
        const exactMatch = this.panel.files[path];
        
        if (exactMatch) {
            this.terminal.addOutput(`Content of ${path}:`);
            this.terminal.addOutput('```');
            this.terminal.addOutput(exactMatch);
            this.terminal.addOutput('```');
            return;
        }
        
        // Try partial match
        const files = Object.keys(this.panel.files);
        const matchingFiles = files.filter(f => f.includes(path));
        
        if (matchingFiles.length === 1) {
            const file = matchingFiles[0];
            this.terminal.addOutput(`Content of ${file}:`);
            this.terminal.addOutput('```');
            this.terminal.addOutput(this.panel.files[file]);
            this.terminal.addOutput('```');
        } else if (matchingFiles.length > 1) {
            this.terminal.addOutput(`Multiple files match "${path}":`);
            matchingFiles.forEach(file => {
                this.terminal.addOutput(`  ${file}`);
            });
            this.terminal.addOutput('Please specify a unique file name.');
        } else {
            this.terminal.addOutput(`File not found: ${path}`);
        }
    }
}

// Make the class available globally
window.HolographicTerminalCommands = HolographicTerminalCommands;