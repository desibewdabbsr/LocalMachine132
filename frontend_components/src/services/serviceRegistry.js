import React from 'react';
import ChatPanel from '../components/chat/ChatPanel';
import Terminal from '../components/terminal/Terminal';
import CodeEditor from '../components/editor/CodeEditor';
import FileBrowser from '../components/files/FileBrowser';

/**
 * Service Registry
 * Defines all available services in the application
 */
const serviceRegistry = {
  // Available services
  services: {
    chat: {
      id: 'chat',
      title: 'Chat',
      icon: '💬',
      component: ChatPanel,
      allowMultiple: false
    },
    terminal: {
      id: 'terminal',
      title: 'Terminal',
      icon: '💻',
      component: Terminal,
      allowMultiple: true
    },
    'file-editor': {
      id: 'file-editor',
      title: 'Editor',
      icon: '📝',
      component: CodeEditor,
      allowMultiple: true,
      hideFromMenu: true 
    },
    'file-browser': {
      id: 'file-browser',
      title: 'Files',
      icon: '📁',
      component: FileBrowser,
      allowMultiple: false
    },

    metrics: {
      id: 'metrics',
      title: 'Metrics',
      icon: '📊',
      component: () => <div>Metrics Panel</div>,
      allowMultiple: false
    },
    explorer: {
      id: 'explorer',
      title: 'Explorer',
      icon: '🔍',
      component: () => <div>Explorer Panel</div>,
      allowMultiple: false
    },
    settings: {
      id: 'settings',
      title: 'Settings',
      icon: '⚙️',
      component: () => <div>Settings Panel</div>,
      allowMultiple: false
    }
  },

  /**
   * Get a service by ID
   * @param {string} serviceId - Service identifier
   * @returns {Object} Service object or null if not found
   */
  getService(serviceId) {
    return this.services[serviceId] || null;
  },

  /**
   * Get all services
   * @returns {Array} Array of service objects
   */
  getAllServices() {
    return Object.values(this.services);
  }
};

export default serviceRegistry;