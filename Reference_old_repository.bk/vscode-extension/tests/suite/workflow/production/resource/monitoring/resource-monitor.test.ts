/**
 * @jest-environment jsdom
 */

jest.mock('vscode', () => ({
    window: {
        withProgress: jest.fn().mockImplementation(function(options: any, task: any) {
            return Promise.resolve(task({ report: jest.fn() }));
        }),
        showErrorMessage: jest.fn().mockImplementation(() => Promise.resolve('View Details'))
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
            logOperation: jest.fn().mockImplementation((...args: any[]) => {
                const fn = args[2];
                return Promise.resolve(fn());
            })
        })
    }
}));

jest.mock('../../../../../../src/workflow/build/monitoring/performance-tracker', () => ({
    PerformanceTracker: jest.fn().mockImplementation(() => ({
        initialize: jest.fn().mockImplementation(() => Promise.resolve()),
        startTracking: jest.fn().mockImplementation(() => Promise.resolve('test-session')),
        trackOperation: jest.fn().mockImplementation((...args: any[]) => {
            const fn = args[1];
            return Promise.resolve(fn());
        })
    }))
}));


import { describe, expect, test, beforeEach, jest } from '@jest/globals';
import { ResourceMonitor, MonitorConfig } from '../../../../../../src/workflow/production/resource/monitoring/resource-monitor';
import { EnhancedLogger } from '../../../../../../src/utils/logger';
import { ResourceAlert } from '../../../../../../src/workflow/production/resource/core/resource-manager-types';
import * as vscode from 'vscode';

describe('ResourceMonitor', () => {
    let monitor: ResourceMonitor;
    let mockLogger: jest.Mocked<EnhancedLogger>;
    let mockNetworkService: any;
    let testConfig: MonitorConfig;
    const TEST_NETWORK_URL = 'http://127.0.0.1:8545';

    beforeEach(() => {
        jest.clearAllMocks();
        
        mockNetworkService = {
            connect: jest.fn().mockImplementation(function() {
                return Promise.resolve('connected');
            }),
            validateConnection: jest.fn().mockImplementation(function() {
                return Promise.resolve(true);
            })
        };

        testConfig = {
            enabled: true,
            interval: 5000,
            thresholds: {
                memory: { warning: 70, critical: 85 },
                cpu: { warning: 75, critical: 90 },
                disk: { warning: 80, critical: 95 }
            },
            autoOptimize: true
        };

        mockLogger = (EnhancedLogger.getInstance() as jest.Mocked<EnhancedLogger>);
        monitor = new ResourceMonitor(testConfig, TEST_NETWORK_URL, mockNetworkService);
    });

    test('initializes successfully', async () => {
        await monitor.initialize();
        expect(mockLogger.info).toHaveBeenCalledWith(
            'Resource monitor initialized successfully'
        );
    });

    test('starts monitoring after initialization', async () => {
        await monitor.initialize();
        await monitor.startMonitoring();
        expect(mockLogger.info).toHaveBeenCalledWith(
            expect.stringContaining('Resource monitoring started')
        );
    });

    test('prevents monitoring before initialization', async () => {
        await expect(monitor.startMonitoring())
            .rejects.toThrow('Resource monitor not initialized');
    });

    test('handles critical resource states', async () => {
        await monitor.initialize();
        
        (monitor as any).handleAnalysisResults({
            memory: { status: 'critical', value: 90, threshold: 85, details: 'Critical memory usage' },
            cpu: { status: 'healthy', value: 60, threshold: 90, details: 'Normal CPU usage' },
            disk: { status: 'healthy', value: 70, threshold: 95, details: 'Normal disk usage' },
            trends: { memory: 'increasing', cpu: 'stable', disk: 'stable' },
            timestamp: Date.now(),
            recommendations: ['Optimize memory usage']
        });

        expect(vscode.window.showErrorMessage).toHaveBeenCalled();
    });

    test('stops monitoring successfully', async () => {
        await monitor.initialize();
        await monitor.startMonitoring();
        await monitor.stopMonitoring();
        expect(mockLogger.info).toHaveBeenCalledWith('Resource monitoring stopped');
    });

    test('manages alerts correctly', async () => {
        await monitor.initialize();
        const testAlert: ResourceAlert = {
            type: 'memory',
            severity: 'critical',
            message: 'Test alert',
            timestamp: Date.now(),
            metrics: {}
        };

        (monitor as any).alerts.push(testAlert);
        expect(monitor.getAlerts()).toHaveLength(1);
        
        monitor.clearAlerts();
        expect(monitor.getAlerts()).toHaveLength(0);
    });
});

// npm run test -- tests/suite/workflow/production/resource/monitoring/resource-monitor.test.ts