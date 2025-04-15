import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ToggleSwitch } from './ToggleSwitch';

const meta = {
    title: 'Controls/ToggleSwitch',
    component: ToggleSwitch,
    parameters: {
        layout: 'centered',
    },
} satisfies Meta<typeof ToggleSwitch>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default handler for all stories
const defaultHandler = (value: boolean) => {
    console.log('Toggle state changed:', value);
};

export const Primary: Story = {
    args: {
        label: 'System Power',
        isOn: false,
        variant: 'primary',
        onChange: defaultHandler
    }
};

export const Warning: Story = {
    args: {
        label: 'Critical System',
        isOn: true,
        variant: 'warning',
        onChange: defaultHandler
    }
};

export const Critical: Story = {
    args: {
        label: 'Emergency Override',
        isOn: false,
        variant: 'critical',
        onChange: defaultHandler
    }
};