import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { CommandButton } from './CommandButton';

const meta = {
    title: 'Controls/CommandButton',
    component: CommandButton,
    parameters: {
        layout: 'centered',
    },
} satisfies Meta<typeof CommandButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
    args: {
        label: 'Execute Command',
        variant: 'primary',
        size: 'medium'
    }
};