/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';

jest.mock('vscode', () => ({
    window: {
        withProgress: jest.fn((options, task) => task({ report: jest.fn() })),
        showInformationMessage: jest.fn()
    },
    ProgressLocation: {
        Notification: 1
    }
}));


jest.mock('../../../../../../src/utils/logger', () => ({
    EnhancedLogger: {
        getInstance: jest.fn().mockReturnValue({
            info: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
            logOperation: jest.fn().mockImplementation(async (_, __, fn) => fn()),
            getConfig: jest.fn().mockReturnValue({
                logLevel: 'INFO',
                mode: 'development'
            })
        })
    }
}));

import { MockVSCodeAPI } from '../../../../../mockes/vscode-api';
import React from 'react';
import { describe, expect, test, beforeEach } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MetricsVisualizer } from '../../../../../../webview/components/features/monitoring/metrics-visualizer';
import { act } from '@testing-library/react';
import { EnhancedLogger } from '../../../../../../src/utils/logger';



describe('MetricsVisualizer', () => {
    let mockLogger: jest.Mocked<EnhancedLogger>;
    let mockVSCode: MockVSCodeAPI;
    
    beforeEach(() => {
        mockLogger = {
            debug: jest.fn(),
            info: jest.fn(),
            error: jest.fn(),
            logOperation: jest.fn().mockImplementation(async (_, __, fn) => fn())
        } as any;

        mockVSCode = new MockVSCodeAPI();
        mockVSCode.postMessage = jest.fn();

        (EnhancedLogger.getInstance as jest.Mock).mockReturnValue(mockLogger);
    });




    test('renders loading state initially', () => {
        const { container } = render(<MetricsVisualizer vscode={mockVSCode} />);
        const loadingElement = screen.queryByText('Loading metrics...');
        expect(loadingElement).toBeTruthy();
    });

    test('displays metrics data when loaded', async () => {
        const mockMetrics = {
            performance: {
                responseTime: 100,
                throughput: 50,
                latency: 20
            },
            resources: {
                cpuUsage: 45,
                memoryUsage: 256,
                networkIO: 1024
            },
            operations: []
        };
    
        render(<MetricsVisualizer vscode={mockVSCode} />);
    
        await act(async () => {
            window.dispatchEvent(new MessageEvent('message', {
                data: { type: 'metricsUpdate', data: mockMetrics }
            }));
        });
    
        await waitFor(() => {
            const responseTimeElement = screen.queryByText('Response Time');
            const valueElement = screen.queryByText('100ms');
            expect(responseTimeElement).toBeTruthy();
            expect(valueElement).toBeTruthy();
        });
    });


    test('handles message processing errors', async () => {
        render(<MetricsVisualizer vscode={mockVSCode} />);
        
        await act(async () => {
            window.dispatchEvent(new MessageEvent('message', {
                data: { type: 'metricsUpdate', data: null }
            }));
        });
        
        await waitFor(() => {
            expect(screen.queryByText('Failed to process metrics update')).toBeTruthy();
        });
    });

    test('cleans up event listeners on unmount', () => {
        const { unmount } = render(<MetricsVisualizer vscode={mockVSCode} />);
        const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
        
        unmount();
        
        expect(removeEventListenerSpy).toHaveBeenCalledWith('message', expect.any(Function));
    });
 
    
    
    
    
    
    
    test('updates metrics on new data', async () => {
        render(<MetricsVisualizer vscode={mockVSCode} />);

        const newMetrics = {
            performance: {
                responseTime: 150,
                throughput: 75,
                latency: 30
            },
            resources: {
                cpuUsage: 60,
                memoryUsage: 512,
                networkIO: 2048
            },
            operations: []
        };

        await act(async () => {
            window.dispatchEvent(new MessageEvent('message', {
                data: { type: 'metricsUpdate', data: newMetrics }
            }));
        });

        await waitFor(() => {
            const responseTimeValue = screen.queryByText('150ms');
            const cpuUsageValue = screen.queryByText('60%');
            expect(responseTimeValue).toBeTruthy();
            expect(cpuUsageValue).toBeTruthy();
        });

        expect(screen.queryByText('75/s')).toBeTruthy();
        expect(screen.queryByText('512MB')).toBeTruthy();
        expect(screen.queryByText('2048KB/s')).toBeTruthy();
    });
});

