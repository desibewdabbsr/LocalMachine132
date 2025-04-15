/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PerformanceMetric } from '../../../../../../src/webview/components/common/indicators/PerformanceMetric';

describe('PerformanceMetric Component', () => {
    const mockMetrics = [
        {
            value: 75,
            threshold: 90,
            unit: '%',
            label: 'CPU Usage'
        }
    ];

    test('renders metrics correctly', () => {
        render(<PerformanceMetric metrics={mockMetrics} />);
        expect(screen.getByText('CPU Usage')).toBeInTheDocument();
        expect(screen.getByText(/Threshold: 90/)).toBeInTheDocument();
        expect(screen.getByText('75.00')).toBeInTheDocument();
    });

    test('updates metrics in real-time', () => {
        jest.useFakeTimers();
        const onThresholdExceeded = jest.fn();

        render(
            <PerformanceMetric 
                metrics={mockMetrics}
                refreshRate={1000}
                onThresholdExceeded={onThresholdExceeded}
            />
        );

        act(() => {
            jest.advanceTimersByTime(1000);
        });

        const valueElement = screen.getByText(/\d+\.\d+/);
        expect(valueElement).toBeInTheDocument();
        
        jest.useRealTimers();
    });
});