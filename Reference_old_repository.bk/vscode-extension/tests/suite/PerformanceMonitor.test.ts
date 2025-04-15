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
    },
    ExtensionMode: {
        Test: 2,
        Development: 1,
        Production: 3
    }
}));

jest.mock('../../src/utils/logger', () => ({
    EnhancedLogger: {
        getInstance: jest.fn().mockReturnValue({
            info: jest.fn(),
            error: jest.fn(),
            logOperation: jest.fn().mockImplementation(async (_: string, __: string, fn: () => Promise<any>) => fn())
        })
    }
}));

import { PerformanceMonitor } from '../../src/metrics/PerformanceMonitor';
import { HardwareConfig } from '../types';
import { EnhancedLogger } from '../../src/utils/logger';

describe('PerformanceMonitor', () => {
    let performanceMonitor: PerformanceMonitor;
    let mockLogger: EnhancedLogger;
    
    const defaultConfig: HardwareConfig = {
        device: 'cpu',
        threads: 4,
        memoryLimit: 4096,
        batchSize: 8,
        memoryAllocation: 'dynamic',
        cudaCores: 0,
        cpuArchitecture: 'x86',
        multiGpu: false,
        performanceMode: 'balanced'
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockLogger = EnhancedLogger.getInstance();
        performanceMonitor = new PerformanceMonitor(defaultConfig, mockLogger);
    });

    test('initializes with default configuration', () => {
        const metrics = performanceMonitor.collectMetrics();
        expect(metrics).toEqual(expect.objectContaining({
            cpuUsage: expect.any(Number),
            memoryUsage: expect.any(Number),
            threadUtilization: expect.any(Number),
            timestamp: expect.any(Number)
        }));
    });

    test('collects GPU metrics when CUDA is enabled', async () => {
        const gpuConfig: HardwareConfig = {
            ...defaultConfig,
            device: 'cuda',
            cudaCores: 3584
        };
        
        performanceMonitor = new PerformanceMonitor(gpuConfig, mockLogger);
        const metrics = performanceMonitor.collectMetrics();
        
        expect(metrics).toEqual(expect.objectContaining({
            gpuUtilization: expect.any(Number),
            vramUsage: expect.any(Number)
        }));
    });

    test('maintains performance history', async () => {
        await new Promise(resolve => setTimeout(resolve, 1100)); // Wait for first collection
        const history = await performanceMonitor.getPerformanceHistory();
        
        expect(history.length).toBeGreaterThan(0);
        expect(history[0]).toEqual(expect.objectContaining({
            timestamp: expect.any(Number),
            cpuUsage: expect.any(Number)
        }));
    });

    test('handles cleanup properly', () => {
        const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
        performanceMonitor.cleanup();
        expect(clearIntervalSpy).toHaveBeenCalled();
    });
});

// npm run test -- tests/suite/PerformanceMonitor.test.ts