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
            warn: jest.fn(),
            logOperation: jest.fn().mockImplementation(async (_: string, __: string, fn: () => Promise<any>) => fn())
        })
    }
}));

import { CoreModule } from '../../src/CoreModule';
import { HardwareConfig } from '../types';
import { VSCodeWrapper } from '../../src/webview/vscode-api';

describe('CoreModule', () => {
    let coreModule: CoreModule;
    let mockVscodeApi: VSCodeWrapper;

    beforeEach(() => {
        jest.clearAllMocks();
        mockVscodeApi = new VSCodeWrapper();
        coreModule = new CoreModule();
    });

    afterEach(() => {
        coreModule.cleanup();
    });

    test('initializes with default hardware configuration', async () => {
        const config = coreModule.getHardwareConfig();
        expect(config).toEqual({
            device: 'cpu',
            threads: expect.any(Number),
            memoryLimit: 4096,
            batchSize: 8,
            memoryAllocation: 'dynamic',
            cudaCores: 0,
            cpuArchitecture: 'auto',
            multiGpu: false,
            performanceMode: 'balanced'
        });
    });

    test('handles hardware configuration updates', async () => {
        const newConfig: HardwareConfig = {
            device: 'cuda',
            threads: 8,
            memoryLimit: 8192,
            batchSize: 16,
            memoryAllocation: 'static',
            cudaCores: 3584,
            cpuArchitecture: 'x86',
            multiGpu: true,
            performanceMode: 'performance'
        };

        await coreModule.handleWebviewMessage({
            command: 'updateHardwareConfig',
            payload: newConfig
        });

        expect(coreModule.getHardwareConfig()).toEqual(newConfig);
    });

    test('collects performance metrics', async () => {
        const metrics = coreModule.getPerformanceMetrics();
        expect(metrics).toEqual(expect.objectContaining({
            cpuUsage: expect.any(Number),
            memoryUsage: expect.any(Number),
            threadUtilization: expect.any(Number)
        }));
    });

    test('executes commands with timestamp', async () => {
        const timestamp = Date.now();
        await coreModule.handleWebviewMessage({
            command: 'executeOperation',
            timestamp
        });

        const metrics = coreModule.getPerformanceMetrics();
        expect(metrics.timestamp).toBeGreaterThanOrEqual(timestamp);
    });
});