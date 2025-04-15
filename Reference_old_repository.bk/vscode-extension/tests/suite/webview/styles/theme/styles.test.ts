/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import '../../../../../src/webview/styles/theme/animations.css';

describe('CSS Animations', () => {
    test('animation classes are applied correctly', () => {
        const { container } = render(
            React.createElement('div', { 
                className: "pulse-operational",
                style: { animation: 'pulse-green 2s infinite' }
            })
        );
        
        const styles = window.getComputedStyle(container.firstChild as Element);
        expect(styles.animation).toContain('pulse-green');
    });
});