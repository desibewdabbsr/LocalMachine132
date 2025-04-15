import React from 'react';
import type { StoryObj, Meta } from '@storybook/react';
import { COLORS } from './colors';
import { TYPOGRAPHY, FONT_STYLES } from './typography';
import { ANIMATIONS } from './animations';

const meta: Meta = {
    title: 'Theme/Elements',
    parameters: {
        docs: {
            description: {
                component: 'Core theme elements for military-grade UI system'
            }
        }
    }
};

export default meta;
type Story = StoryObj;

// Stories
export const Colors: Story = {
    render: () => (
        <div className="theme-showcase">
            <section className="color-section">
                <h2>Command & Control Colors</h2>
                <div className="color-grid">
                    {Object.entries(COLORS.primary).map(([name, value]) => (
                        <div className="color-item" key={name}>
                            <div className="color-swatch" style={{ backgroundColor: value }} />
                            <span className="color-label">{name}: {value}</span>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    )
};

export const Typography: Story = {
    render: () => (
        <div className="typography-showcase">
            {Object.entries(FONT_STYLES).map(([style, properties]) => (
                <div className="font-sample" key={style}>
                    <span style={properties}>
                        Command Interface Text Sample
                    </span>
                    <code className="font-specs">
                        {JSON.stringify(properties, null, 2)}
                    </code>
                </div>
            ))}
        </div>
    )
};

export const Animations: Story = {
    render: () => (
        <div className="animation-showcase">
            {Object.entries(ANIMATIONS.pulse).map(([type, animation]) => (
                <div className="animation-item" key={type}>
                    <div 
                        className="pulse-demo"
                        style={{ animation }}
                    />
                    <span className="animation-label">{type}</span>
                </div>
            ))}
        </div>
    )
};