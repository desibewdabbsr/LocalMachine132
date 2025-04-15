jest.mock('vscode', () => ({
    window: {
        withProgress: jest.fn((options, task) => task({ report: jest.fn() })),
        showInformationMessage: jest.fn()
    },
    ProgressLocation: {
        Notification: 1
    }
}));

// Fix logger mock path
jest.mock('../../../../../../src/utils/logger', () => ({
    EnhancedLogger: {
        getInstance: jest.fn().mockReturnValue({
            info: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
            logOperation: jest.fn().mockImplementation((_, __, fn) => fn())
        })
    }
}));


jest.mock('../../../../../../src/workflow/build/monitoring/performance-tracker', () => ({
    PerformanceTracker: jest.fn().mockImplementation(() => ({
        initialize: jest.fn().mockResolvedValue(undefined),
        startTracking: jest.fn().mockResolvedValue('test-session'),
        trackOperation: jest.fn().mockImplementation(async (_, fn) => {
            const result = await fn();
            return {
                executionTime: 100,
                memoryUsage: { heapUsed: 1024, heapTotal: 2048 },
                transactionThroughput: 10,
                gasEfficiency: 21000,
                operationSuccess: true,
                timestamp: Date.now(),
                blockRange: { start: 1, end: 10 }
            };
        })
    }))
}));


import { describe, expect, test, beforeEach } from '@jest/globals';
import { ResourceManagerCore } from '../../../../../../src/workflow/production/resource/core/resource-manager-core';
import { ResourceConfig } from '../../../../../../src/workflow/production/resource/core/resource-manager-types';
import { EnhancedLogger } from '../../../../../../src/utils/logger';


describe('ResourceManagerCore', () => {
    let resourceManager: ResourceManagerCore;
    let mockLogger: jest.Mocked<EnhancedLogger>;
    let mockNetworkService: any;
    let testConfig: ResourceConfig;

    const TEST_NETWORK_URL = 'http://127.0.0.1:8545';

    beforeEach(() => {
        // Fix memory usage mock to include rss
        const mockMemoryUsage = {
            heapUsed: 512 * 1024 * 1024,
            heapTotal: 1024 * 1024 * 1024,
            external: 100 * 1024 * 1024,
            arrayBuffers: 50 * 1024 * 1024,
            rss: 2048 * 1024 * 1024  // Add required rss property
        };
        jest.spyOn(process, 'memoryUsage').mockReturnValue(mockMemoryUsage);
       
        mockLogger = {
            info: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
            logOperation: jest.fn().mockImplementation((_, __, fn) => fn())
        } as any;


        mockNetworkService = {
            connect: jest.fn().mockResolvedValue(undefined),
            validateConnection: jest.fn().mockResolvedValue(true)
        };

        testConfig = {
            memoryLimit: 80,
            cpuThreshold: 80,
            diskSpaceThreshold: 1000,
            monitoringInterval: 5000,
            autoScaleEnabled: true,
            logLevel: 'INFO'  // Changed to uppercase to match LogLevel type
        };
        

        resourceManager = new ResourceManagerCore(
            testConfig,
            TEST_NETWORK_URL,
            mockNetworkService,
            mockLogger
        );
    });

    describe('Initialization', () => {
        test('initializes successfully with valid system resources', async () => {
            await resourceManager.initialize();
            
            // Update test to match actual logger output format
            expect(mockLogger.info).toHaveBeenCalledWith(
                `Resource manager core initialized successfully - Config: ${JSON.stringify(testConfig)}, Status: active`
            );
            expect(resourceManager.getStatus()).toBe('active');
        });

        test('handles initialization failure when system requirements not met', async () => {
            // Simulate high memory usage
            jest.spyOn(process, 'memoryUsage').mockReturnValue({
                heapUsed: 900 * 1024 * 1024,
                heapTotal: 1024 * 1024 * 1024
            } as any);

            await expect(resourceManager.initialize())
                .rejects.toThrow('Failed to initialize resource manager');
            expect(resourceManager.getStatus()).toBe('error');
        });
    });

    describe('Status Management', () => {
        test('maintains correct status through lifecycle', async () => {
            expect(resourceManager.getStatus()).toBe('paused');
            
            await resourceManager.initialize();
            expect(resourceManager.getStatus()).toBe('active');
            
            resourceManager.dispose();
            expect(resourceManager.getStatus()).toBe('paused');
        });
    });

    describe('Error Handling', () => {
        test('prevents operations before initialization', async () => {
            const operation = async () => {
                resourceManager['validateInitialization']();
            };
            
            await expect(operation())
                .rejects.toThrow('Resource manager not initialized');
        });
    });
});


// npm run test -- tests/suite/workflow/production/resource/core/resource-manager-core.test.ts