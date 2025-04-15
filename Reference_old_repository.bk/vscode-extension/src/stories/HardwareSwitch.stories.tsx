import React from 'react';
import type { Meta, StoryObj, ReactRenderer } from '@storybook/react';
import { HardwareSwitch } from '../webview/components/interactive/ConfigManager/HardwareSwitch.tsx';
import { VSCodeWrapper } from '../webview/vscode-api';
import { ThemeSystem } from '../webview/centralized-theme';
import '../webview/styles/theme/base.css';  


const mockVSCodeApi = new VSCodeWrapper();

const meta: Meta<typeof HardwareSwitch> = {
    title: 'Components/HardwareSwitch',
    component: HardwareSwitch,
    parameters: {
        layout: 'centered',
    },
    decorators: [
        (Story: React.ComponentType) => (
            <div style={{ 
                background: ThemeSystem.COLORS.background.deep,
                padding: '2rem',
                borderRadius: '8px'
            }}>
                <Story />
            </div>
        )
    ]
};

export default meta;

type Story = StoryObj<typeof HardwareSwitch>;

// Base story with default configuration
export const Default: Story = {
    args: {
        vscodeApi: mockVSCodeApi,
        onConfigChange: (config) => console.log('Config changed:', config)
    }
};

// GPU-enabled configuration
export const GPUMode: Story = {
    args: {
        ...Default.args,
        initialDevice: 'cuda'
    }
};

// High-performance mode configuration
export const HighPerformance: Story = {
    args: {
        ...Default.args,
        initialPerformanceMode: 'performance'
    }
};

// Low-power mode configuration
export const LowPowerMode: Story = {
    args: {
        ...Default.args,
        initialDevice: 'cpu',
        initialPerformanceMode: 'low'
    }
};