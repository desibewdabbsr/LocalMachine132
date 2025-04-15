/**
 * Holographic Terminal
 * Integrates terminal core and commands
 */
class HolographicTerminal {
    constructor(panel) {
        this.panel = panel;
        this.core = new HolographicTerminalCore(panel);
        this.commands = null;
        this.element = null;
        this.initialized = false;
    }
    
    /**
     * Initialize the terminal
     */
    init() {
        console.log('Initializing holographic terminal...');
        
        // Initialize core
        this.core.init();
        
        // Create commands handler
        this.commands = new HolographicTerminalCommands(this.core, this.panel);
        
        // Link commands to core
        this.core.commands = this.commands;
        
        // Add welcome message
        this.addOutput('AI Development Assistant Terminal');
        this.addOutput('Type "help" for available commands');
        this.addOutput('');
        
        this.initialized = true;
    }
    
    /**
     * Render the terminal
     * @returns {HTMLElement} - Terminal element
     */
    render() {
        this.element = this.core.render();
        return this.element;
    }
    
    /**
     * Update the UI
     */
    updateUI() {
        this.core.updateUI();
    }
    
    /**
     * Add input to terminal
     * @param {string} text - Input text
     */
    addInput(text) {
        this.core.addInput(text);
    }
    
    /**
     * Add output to terminal
     * @param {string} text - Output text
     */
    addOutput(text) {
        this.core.addOutput(text);
    }
    
    /**
     * Execute a command
     * @param {string} command - Command to execute
     */
    executeCommand(command) {
        this.commands.executeCommand(command);
    }
}

// Make the class available globally
window.HolographicTerminal = HolographicTerminal;