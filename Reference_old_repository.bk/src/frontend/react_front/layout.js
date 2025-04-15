/**
 * Layout Manager
 * Controls the application layout
 */
class Layout {
    constructor() {
        this.services = {};
        this.activeServices = [];
        // Define available workspaces
        this.workspaces = {
            midPanel: { element: null, name: 'Left Panel' },
            rightTop: { element: null, name: 'Right Top' },
            rightBottom: { element: null, name: 'Right Bottom' }
        };
    }

    /**
     * Initialize the layout
     * @param {HTMLElement} container - Container element
     */
    init(container) {
        console.log('Initializing layout...');
        
        // Clear the container
        container.innerHTML = '';
        container.className = 'main-container';
        
        // Create layout structure
        container.innerHTML = `
            <div class="edge-border"></div>
            <div class="v-divider-1"></div>
            <div class="v-divider-2"></div>
            <div class="h-divider"></div>
            <div class="right-panel-divider"></div>
            
            <div class="left-panel"></div>
            <div class="mid-panel"></div>
            <div class="right-panel">
                <div class="right-top"></div>
                <div class="right-bottom"></div>
            </div>
            <div class="status-bar">
                <span>Ready</span>
                <span class="status-indicator"></span>
            </div>
        `;
        
        // Store panel references
        this.leftPanel = container.querySelector('.left-panel');
        this.midPanel = container.querySelector('.mid-panel');
        this.rightTop = container.querySelector('.right-top');
        this.rightBottom = container.querySelector('.right-bottom');
        this.statusBar = container.querySelector('.status-bar');
        
        // Store workspace elements
        this.workspaces.midPanel.element = this.midPanel;
        this.workspaces.rightTop.element = this.rightTop;
        this.workspaces.rightBottom.element = this.rightBottom;
        
        console.log('Layout initialized');
    }
    
    /**
     * Register a service
     * @param {string} name - Service name
     * @param {object} component - Service component
     * @param {string} icon - Service icon
     */
    registerService(name, component, icon) {
        console.log(`Registering service: ${name}`);
        
        // Store service with initial workspace
        this.services[name] = {
            component,
            element: null,
            active: false,
            currentWorkspace: 'rightTop' // Default workspace
        };
        
        // Create button
        const button = document.createElement('div');
        button.className = 'icon-button';
        button.textContent = icon;
        button.title = name;
        
        // Single click to toggle service
        button.addEventListener('click', () => this.toggleService(name));
        
        // Double click to cycle workspaces
        button.addEventListener('dblclick', () => this.cycleWorkspace(name));
        
        // Add to sidebar
        this.leftPanel.appendChild(button);
        
        return button;
    }
    
    /**
     * Cycle service through workspaces
     * @param {string} name - Service name
     */
    cycleWorkspace(name) {
        console.log(`Cycling workspace for: ${name}`);
        
        const service = this.services[name];
        if (!service || !service.active) return;
        
        // Define workspace order
        const workspaceOrder = ['rightTop', 'midPanel', 'rightBottom'];
        
        // Find current workspace index
        const currentIndex = workspaceOrder.indexOf(service.currentWorkspace);
        
        // Calculate next workspace index
        const nextIndex = (currentIndex + 1) % workspaceOrder.length;
        const nextWorkspace = workspaceOrder[nextIndex];
        
        // Move service to next workspace
        if (service.element) {
            service.element.remove();
        }
        
        service.currentWorkspace = nextWorkspace;
        
        // Re-render service in new workspace
        if (service.component && typeof service.component.render === 'function') {
            service.element = service.component.render();
            this.workspaces[nextWorkspace].element.appendChild(service.element);
        }
        
        // Update status bar
        this.updateStatusBar();
        
        console.log(`Moved ${name} to ${this.workspaces[nextWorkspace].name}`);
    }
    





    /**
     * Toggle a service
     * @param {string} name - Service name
     */
    // Add or modify this method in the Layout class
    toggleService(name) {
        console.log(`Toggling service: ${name}`);

        const service = this.services[name];
        if (!service) {
            console.error(`Service not found: ${name}`);
            return;
        }

        // Toggle active state
        service.active = !service.active;

        // Update button appearance
        const button = Array.from(this.leftPanel.children).find(el => el.title === name);
        if (button) {
            if (service.active) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        }

        // Update content
        if (service.active) {
            try {
                // Create component element
                if (service.component && typeof service.component.render === 'function') {
                    service.element = service.component.render();
                    if (service.element) {
                        this.workspaces[service.currentWorkspace].element.appendChild(service.element);
                        console.log(`Service ${name} rendered successfully`);
                    } else {
                        console.error(`Service ${name} render() returned null or undefined`);
                    }
                } else {
                    console.error(`Service ${name} has no render method`);
                }
            } catch (e) {
                console.error(`Error rendering service ${name}:`, e);
            }
        } else if (service.element) {
            // Remove component
            try {
                service.element.remove();
            } catch (e) {
                console.error(`Error removing service ${name}:`, e);
            }
            service.element = null;
        }

        // Update active services list
        this.activeServices = Object.keys(this.services).filter(key => this.services[key].active);

        // Update status bar
        this.updateStatusBar();
    }
    







    /**
     * Update the status bar
     */
    updateStatusBar() {
        const statusIndicator = this.statusBar.querySelector('.status-indicator');
        if (statusIndicator) {
            // Create status text with workspace information
            const statusText = Object.keys(this.services)
                .filter(name => this.services[name].active)
                .map(name => {
                    const workspace = this.services[name].currentWorkspace;
                    return `${name}: ${this.workspaces[workspace].name}`;
                })
                .join(' | ');
            
            statusIndicator.textContent = statusText;
        }
    }
}

// Ensure Layout is globally available
window.Layout = Layout;
console.log("Layout class defined");