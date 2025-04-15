import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { HardwareSwitch } from './components/interactive/ConfigManager/HardwareSwitch.tsx';
import { VSCodeWrapper } from './vscode-api';
import './components/interactive/ConfigManager/HardwareSwitch.css';

// Initialize VSCode API wrapper at the top level
const vscodeApi = new VSCodeWrapper();

const HardwareConfigApp: React.FC = () => {
    useEffect(() => {
        console.log('HardwareConfigApp mounted');
        return () => console.log('HardwareConfigApp unmounted');
    }, []);

    const handleConfigChange = (config: any) => {
        vscodeApi.postMessage({
            type: 'configUpdate',
            payload: config
        });
    };

    return (
        <div className="hardware-switch-container" style={{
            padding: '20px',
            border: '2px solid red'
        }}>
            <h1>Hardware Configuration</h1>
            <HardwareSwitch 
                onConfigChange={handleConfigChange}
                vscodeApi={vscodeApi}  // Pass the vscodeApi instance
            />
        </div>
    );
};

// Initialize with proper VSCode API
console.log('Starting initialization');
const container = document.getElementById('root');
console.log('Root container:', container);

if (container) {
    const root = createRoot(container);
    root.render(
        <React.StrictMode>
            <HardwareConfigApp />
        </React.StrictMode>
    );
    console.log('Render triggered');
}


