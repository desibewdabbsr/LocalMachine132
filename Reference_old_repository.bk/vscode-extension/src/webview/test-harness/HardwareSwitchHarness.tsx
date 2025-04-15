import React from 'react';
import { HardwareSwitch } from '../components/interactive/ConfigManager/HardwareSwitch.tsx';
import '../components/interactive/ConfigManager/HardwareSwitch.css';
import { VSCodeWrapper } from '../vscode-api';

// Create mock VSCode API instance for testing
const mockVscodeApi = new VSCodeWrapper();

export const HardwareSwitchHarness = () => {
    console.log('Rendering HardwareSwitchHarness');

    const handleConfigChange = (config: any) => {
        console.log('Config changed:', config);
    };

    return (
        <div style={{ padding: '2rem' }}>
            <h2>Hardware Switch Component Test</h2>
            <HardwareSwitch 
                onConfigChange={handleConfigChange}
                vscodeApi={mockVscodeApi}
            />
        </div>
    );
};