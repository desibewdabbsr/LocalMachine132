/**
 * @jest-environment jsdom
 */

jest.mock('vscode', () => ({
    window: {
        withProgress: jest.fn((options, task) => task({ report: jest.fn() })),
        showInformationMessage: jest.fn()
    },
    ProgressLocation: {
        Notification: 1
    }
}));

import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MetricsDashboard } from '../../../../../src/webview/components/monitoring/Dashboard';
import { VSCodeWrapper } from '../../../../../src/webview/vscode-api';

describe('MetricsDashboard', () => {
    let mockVscodeApi: VSCodeWrapper;

    beforeEach(() => {
        jest.useFakeTimers();
        mockVscodeApi = new VSCodeWrapper();
        mockVscodeApi.postMessage = jest.fn();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test('renders initial dashboard state', () => {
        render(<MetricsDashboard vscodeApi={mockVscodeApi} />);
        expect(screen.getByTestId('metrics-dashboard')).toBeInTheDocument();
    });

    test('updates metrics in real-time', () => {
        render(<MetricsDashboard vscodeApi={mockVscodeApi} />);

        act(() => {
            window.dispatchEvent(new MessageEvent('message', {
                data: {
                    type: 'metrics',
                    payload: {
                        cpuUsage: 45,
                        memoryUsage: 60
                    }
                }
            }));
        });

        expect(screen.getByText('CPU: 45%')).toBeInTheDocument();
        expect(screen.getByText('Memory: 60%')).toBeInTheDocument();
    });

    test('displays system alerts', () => {
        render(<MetricsDashboard vscodeApi={mockVscodeApi} />);

        act(() => {
            window.dispatchEvent(new MessageEvent('message', {
                data: {
                    type: 'alert',
                    payload: {
                        level: 'warning',
                        message: 'High CPU usage detected',
                        timestamp: Date.now()
                    }
                }
            }));
        });

        expect(screen.getByText('High CPU usage detected')).toBeInTheDocument();
    });

    test('requests metrics periodically', () => {
        render(<MetricsDashboard vscodeApi={mockVscodeApi} />);

        act(() => {
            jest.advanceTimersByTime(2000);
        });

        expect(mockVscodeApi.postMessage).toHaveBeenCalledWith({
            command: 'getMetrics'
        });
        expect(mockVscodeApi.postMessage).toHaveBeenCalledTimes(2);
    });
});