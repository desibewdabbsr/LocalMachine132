import React, { useState, useEffect } from 'react';
import TabManager from '../components/tab/TabManager';
// import VerticalDivider from '../components/layout/VerticalDivider';
import workspaceService from '../services/workspaceService';
import serviceRegistry from '../services/serviceRegistry';
import './WorkspaceManager.css';

// Check if this import is present
import DragDropService, { DropTarget } from '../components/dnd/DragDropService';

/**
 * WorkspaceManager Component
 * Manages workspaces, tabs, and service instances
 */
const WorkspaceManager = () => {
  // State for workspaces
  const [workspaces, setWorkspaces] = useState(workspaceService.getDefaultState());
  
  // State for terminal instance counter
  const [terminalCounter, setTerminalCounter] = useState(1);
  
  // State for workspace3 maximize
  const [isWorkspace3Maximized, setIsWorkspace3Maximized] = useState(false);
  
  // State for workspace3 tab width
  const [workspace3TabWidth, setWorkspace3TabWidth] = useState(150);

  // Load workspace state on component mount
  useEffect(() => {
    const loadWorkspaceState = async () => {
      const state = await workspaceService.loadState();
      setWorkspaces(state);
      
      // Calculate highest terminal instance ID for counter
      let highestTerminalId = 0;
      Object.values(state).forEach(workspace => {
        workspace.tabs.forEach(tab => {
          if (tab.serviceId === 'terminal' && tab.instanceId > highestTerminalId) {
            highestTerminalId = tab.instanceId;
          }
        });
      });
      setTerminalCounter(highestTerminalId);
    };
    
    loadWorkspaceState();
  }, []);

  // Save workspace state when it changes
  useEffect(() => {
    workspaceService.saveState(workspaces);
  }, [workspaces]);



  // Add this useEffect in the WorkspaceManager component
  useEffect(() => {
    // Listen for file open events
    const handleOpenFile = (event) => {
      const { targetWorkspace, file } = event.detail;

      console.log('WorkspaceManager received file open event:', event.detail);
      console.log('File to be added to workspace:', file);
      console.log('File content in data:', file?.data?.content);

      if (!targetWorkspace || !file) {
        console.error('Missing targetWorkspace or file in event');
        return;
      }

      setWorkspaces(prev => {
        const workspace = {...prev[targetWorkspace]};
        
        // Check if file is already open
        const isFileOpen = workspace.tabs.some(tab => tab.id === file.id);
        
        if (isFileOpen) {
          console.log('File already open, activating tab:', file.id);
          // Just activate the tab
          workspace.activeTabId = file.id;
        } else {
          console.log('Adding new file tab:', file);
          // Add the file as a new tab
          workspace.tabs = [...workspace.tabs, file];
          workspace.activeTabId = file.id;
        }
        
        return {
          ...prev,
          [targetWorkspace]: workspace
        };
      });
    };


    
    window.addEventListener('LocalMachine132:openFile', handleOpenFile);
    
    return () => {
      window.removeEventListener('LocalMachine132:openFile', handleOpenFile);
    };
  }, []);





  // Toggle service active state
  const toggleService = (serviceId) => {
    const service = serviceRegistry.getService(serviceId);
    if (!service) return;

    // Check if service is already open in any workspace
    let isServiceOpen = false;
    let existingWorkspace = null;
    
    Object.keys(workspaces).forEach(workspaceId => {
      const workspace = workspaces[workspaceId];
      const serviceTab = workspace.tabs.find(tab => tab.serviceId === serviceId);
      
      if (serviceTab && !service.allowMultiple) {
        isServiceOpen = true;
        existingWorkspace = workspaceId;
      }
    });

    // If service is already open and doesn't allow multiple instances, activate it
    if (isServiceOpen && !service.allowMultiple) {
      setWorkspaces(prev => ({
        ...prev,
        [existingWorkspace]: {
          ...prev[existingWorkspace],
          activeTabId: prev[existingWorkspace].tabs.find(tab => tab.serviceId === serviceId).id
        }
      }));
      return;
    }

    // Determine target workspace based on service type
    let targetWorkspace = 'workspace1';
    if (serviceId === 'terminal') {
      targetWorkspace = 'workspace3';
    }

    // Create a new tab ID
    let newTabId;
    if (service.allowMultiple) {
      if (serviceId === 'terminal') {
        newTabId = `terminal-${terminalCounter + 1}`;
        setTerminalCounter(prev => prev + 1);
      } else {
        newTabId = `${serviceId}-${Date.now()}`;
      }
    } else {
      newTabId = serviceId;
    }

    // Add the service to the target workspace
    setWorkspaces(prev => ({
      ...prev,
      [targetWorkspace]: {
        ...prev[targetWorkspace],
        tabs: [...prev[targetWorkspace].tabs, { 
          id: newTabId, 
          serviceId, 
          instanceId: service.allowMultiple ? (terminalCounter + 1) : null 
        }],
        activeTabId: newTabId
      }
    }));
  };

  // Handle tab selection
  const handleTabSelect = (workspaceId, tabId) => {
    setWorkspaces(prev => ({
      ...prev,
      [workspaceId]: {
        ...prev[workspaceId],
        activeTabId: tabId
      }
    }));
  };

  // Handle tab close
  const handleTabClose = (workspaceId, tabId) => {
    setWorkspaces(prev => {
      const workspace = {...prev[workspaceId]};
      const tabIndex = workspace.tabs.findIndex(tab => tab.id === tabId);
      
      if (tabIndex === -1) return prev;
      
      // Remove the tab
      workspace.tabs = workspace.tabs.filter(tab => tab.id !== tabId);
      
      // Update active tab if needed
      if (workspace.activeTabId === tabId) {
        workspace.activeTabId = workspace.tabs.length > 0 ? workspace.tabs[0].id : null;
      }
      
      return {
        ...prev,
        [workspaceId]: workspace
      };
    });
  };

  // Toggle workspace3 maximize state
  const toggleWorkspace3Maximize = () => {
    setIsWorkspace3Maximized(prev => !prev);
  };

  // Render service component
    // In the renderServiceComponent function
  const renderServiceComponent = (workspaceId) => {
    const workspace = workspaces[workspaceId];
    if (!workspace.activeTabId) return null;

    const activeTab = workspace.tabs.find(tab => tab.id === workspace.activeTabId);
    if (!activeTab) return null;

    const service = serviceRegistry.getService(activeTab.serviceId);
    if (!service) return null;

    const ServiceComponent = service.component;

    // Add debugging here
    if (activeTab.serviceId === 'file-editor') {
      console.log('Rendering CodeEditor with tab:', activeTab);
      console.log('Tab data:', activeTab.data);
      console.log('Content in tab data:', activeTab.data?.content);
    }

    return <ServiceComponent instanceId={activeTab.instanceId} file={activeTab} />;
  };




  // Check if this function is present
  const handleServiceDrop = (serviceId, targetWorkspaceId) => {
    const service = serviceRegistry.getService(serviceId);
    if (!service) return;

    // Check if service is already open in the target workspace
    const targetWorkspace = workspaces[targetWorkspaceId];
    const existingTab = targetWorkspace.tabs.find(tab => tab.serviceId === serviceId);
    
    if (existingTab) {
      // If service already exists in target workspace, just activate it
      setWorkspaces(prev => ({
        ...prev,
        [targetWorkspaceId]: {
          ...prev[targetWorkspaceId],
          activeTabId: existingTab.id
        }
      }));
      return;
    }

    // Create a new tab ID
    let newTabId;
    if (service.allowMultiple) {
      if (serviceId === 'terminal') {
        newTabId = `terminal-${terminalCounter + 1}`;
        setTerminalCounter(prev => prev + 1);
      } else {
        newTabId = `${serviceId}-${Date.now()}`;
      }
    } else {
      newTabId = serviceId;
    }

    // Add the service to the target workspace
    setWorkspaces(prev => ({
      ...prev,
      [targetWorkspaceId]: {
        ...prev[targetWorkspaceId],
        tabs: [...prev[targetWorkspaceId].tabs, { 
          id: newTabId, 
          serviceId, 
          instanceId: service.allowMultiple ? (terminalCounter + 1) : null 
        }],
        activeTabId: newTabId
      }
    }));
  };

  // Check if service icons are wrapped with DragDropService
  const serviceMenuContent = (
    <div className="service-icons">
      {serviceRegistry.getAllServices().map(service => (
        <DragDropService
          key={service.id}
          serviceId={service.id}
          serviceIcon={service.icon}
          serviceTitle={service.title}
        >
          <button 
            key={service.id}
            className={`icon-button ${
              Object.values(workspaces).some(workspace => 
                workspace.tabs.some(tab => tab.serviceId === service.id)
              ) ? 'active' : ''
            }`}
            onClick={() => toggleService(service.id)}
            title={service.title}
          >
            {service.icon}
          </button>
        </DragDropService>
      ))}
    </div>
  );

  // Check if workspaces are wrapped with DropTarget
  const renderWorkspaceContent = (workspaceId) => {
    const workspace = workspaces[workspaceId];
    if (!workspace) {
      console.error(`Workspace with ID "${workspaceId}" not found`);
      return <div className="workspace-container"></div>;
    }
    
    const hasTabs = workspace.tabs.length > 0;
    
    return (
      <DropTarget workspaceId={workspaceId} onServiceDrop={handleServiceDrop}>
        <div className="workspace-container">
          {hasTabs && (
              <TabManager 
              tabs={workspace.tabs.map(tab => {
                // Special handling for file-editor service
                if (tab.serviceId === 'file-editor' && tab.title) {
                  return {
                    id: tab.id,
                    title: tab.title
                  };
                }
                
                // Regular service handling
                const service = serviceRegistry.getService(tab.serviceId);
                return {
                  id: tab.id,
                  title: service ? (service.allowMultiple ? `${service.title} ${tab.instanceId}` : service.title) : 'Unknown'
                };
              })}
              activeTabId={workspace.activeTabId}
              onTabSelect={(tabId) => handleTabSelect(workspaceId, tabId)}
              onTabClose={(tabId) => handleTabClose(workspaceId, tabId)}
            />
          )}
          <div className="workspace-content">
            {renderServiceComponent(workspaceId)}
          </div>
        </div>
      </DropTarget>
    );
  };

    // In the WorkspaceManager.jsx file, update the renderTab function:

  const renderTab = (tab, workspaceId) => {
    const isActive = tab.id === workspaces[workspaceId].activeTabId;

    // Get the proper title for the tab
    const tabTitle = tab.title || (tab.data && tab.data.fileName) || "Unknown";

    return (
      <div 
        key={tab.id} 
        className={`workspace-tab ${isActive ? 'active' : ''}`}
        onClick={() => activateTab(workspaceId, tab.id)}
      >
        <span className="tab-title">{tabTitle}</span>
        <button 
          className="tab-close" 
          onClick={(e) => {
            e.stopPropagation();
            closeTab(workspaceId, tab.id);
          }}
        >
          ×
        </button>
      </div>
    );
  };



  // Check if workspace3 is wrapped with DropTarget
  const renderWorkspace3Content = () => {
    const workspace = workspaces.workspace3;
    const hasTabs = workspace.tabs.length > 0;
    
    if (!hasTabs) {
      return (
        <DropTarget workspaceId="workspace3" onServiceDrop={handleServiceDrop}>
          <div className="workspace-container"></div>
        </DropTarget>
      );
    }
    
    return (
      <DropTarget workspaceId="workspace3" onServiceDrop={handleServiceDrop}>
        <div className="workspace-container">
          <div className="workspace3-content-wrapper">
            <div className="workspace3-content">
              {renderServiceComponent('workspace3')}
            </div>
            
            {hasTabs && (
              <div className="workspace3-tabs-container">
                <TabManager 
                  tabs={workspace.tabs.map(tab => {
                    const service = serviceRegistry.getService(tab.serviceId);
                    return {
                      id: tab.id,
                      title: service ? (service.allowMultiple ? `${service.title} ${tab.instanceId}` : service.title) : 'Unknown'
                    };
                  })}
                  activeTabId={workspace.activeTabId}
                  onTabSelect={(tabId) => handleTabSelect('workspace3', tabId)}
                  onTabClose={(tabId) => handleTabClose('workspace3', tabId)}
                  orientation="vertical"
                />
              </div>
            )}
            
            {hasTabs && (
              <div className="vertical-divider"></div>
            )}
          </div>
        </div>
      </DropTarget>
    );
  };

  return {
    serviceMenuContent,
    workspace1Content: renderWorkspaceContent('workspace1'),
    workspace2Content: renderWorkspaceContent('workspace2'),
    workspace3Content: renderWorkspace3Content()
  };
};

export default WorkspaceManager;