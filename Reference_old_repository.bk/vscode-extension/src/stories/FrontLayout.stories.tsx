import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { FrontLayout } from '../webview/front-panel/FrontLayout';
import { ThemeSystem } from '../webview/centralized-theme';
import { VSCodeWrapper } from '../webview/vscode-api';

// Mock VSCodeWrapper for Storybook
const mockVSCodeWrapper = {
    postMessage: async (message: any) => {
        console.log('Mock message:', message);
        return { content: 'Mock response from Llama' };
    },
    getState: () => ({}),
    setState: () => {},
    getInstance: () => mockVSCodeWrapper
};

const meta: Meta<typeof FrontLayout> = {
    title: 'Front Panel/FrontLayout',
    component: FrontLayout,
    parameters: {
        layout: 'fullscreen',
        backgrounds: {
            default: 'dark',
            values: [
                { name: 'dark', value: ThemeSystem.COLORS.background.deep },
                { name: 'darker', value: '#000000' }
            ]
        }
    },
    decorators: [
        (Story) => {
            // Mock VSCodeWrapper for Storybook
            (window as any).acquireVsCodeApi = () => mockVSCodeWrapper;
            
            return (
                <div style={{ 
                    height: '100vh', 
                    width: '100vw',
                    background: ThemeSystem.COLORS.background.deep
                }}>
                    <Story />
                </div>
            );
        }
    ]
};

export default meta;
type Story = StoryObj<typeof FrontLayout>;

// Default state
export const Default: Story = {};

// With active chat
export const WithChat: Story = {
    parameters: {
        mockData: {
            messages: [
                {
                    id: '1',
                    content: 'Hello, can you help with smart contracts?',
                    timestamp: new Date().toISOString(),
                    sender: 'user',
                    status: 'complete'
                },
                {
                    id: '2',
                    content: 'Of course! What type of smart contract do you need help with?',
                    timestamp: new Date().toISOString(),
                    sender: 'llama',
                    status: 'complete'
                }
            ]
        }
    }
};

// Processing state
export const Processing: Story = {
    parameters: {
        mockData: {
            isProcessing: true,
            currentMessage: 'Analyzing smart contract...'
        }
    }
};

// Error state
export const WithError: Story = {
    parameters: {
        mockData: {
            hasError: true,
            errorMessage: 'Failed to process request'
        }
    }
};