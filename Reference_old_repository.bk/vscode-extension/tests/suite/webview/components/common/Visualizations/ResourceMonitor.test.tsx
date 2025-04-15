/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ResourceMonitor } from '../../../../../../src/webview/components/common/Visualizations/ResourceMonitor';

describe('ResourceMonitor Component', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test('renders all monitoring sections', () => {
        const { getByText } = render(<ResourceMonitor />);
        expect(getByText('CPU Usage')).toBeInTheDocument();
        expect(getByText('Memory Usage')).toBeInTheDocument();
        expect(getByText('Network Traffic')).toBeInTheDocument();
    });

    test('updates data at specified refresh rate', () => {
        const { container } = render(<ResourceMonitor refreshRate={1000} />);
        
        act(() => {
            jest.advanceTimersByTime(2000);
        });

        const charts = container.querySelectorAll('canvas');
        expect(charts).toHaveLength(3);
    });
});