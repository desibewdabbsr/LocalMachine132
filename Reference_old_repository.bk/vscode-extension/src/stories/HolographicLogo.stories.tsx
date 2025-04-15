import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { HolographicLogo } from '../../pop-logo/brand/HolographicLogo';
import { ThemeSystem } from '../webview/centralized-theme';

const meta: Meta<typeof HolographicLogo> = {
    title: 'Brand/HolographicLogo',
    component: HolographicLogo,
    parameters: {
        layout: 'centered',
        backgrounds: {
            default: 'terminal',
            values: [
                { name: 'terminal', value: '#0A0A0A' }
            ]
        },
        docs: {
            description: {
                component: 'Holographic 3D logo with data stream effects'
            }
        }
    },
    decorators: [
        (Story) => (
            <div style={{ 
                background: ThemeSystem.COLORS.background.deep,
                padding: '2rem',
                borderRadius: '8px',
                boxShadow: '0 0 20px rgba(0,0,0,0.5)'
            }}>
                <Story />
            </div>
        )
    ]
};

export default meta;
type Story = StoryObj<typeof HolographicLogo>;

export const Default: Story = {};

export const LargeSize: Story = {
    decorators: [
        (Story) => (
            <div style={{ transform: 'scale(1.5)' }}>
                <Story />
            </div>
        )
    ]
};