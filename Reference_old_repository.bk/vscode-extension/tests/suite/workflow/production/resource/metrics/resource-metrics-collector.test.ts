/**
 * @jest-environment jsdom
 */

jest.mock('os', () => ({
    totalmem: jest.fn().mockReturnValue(16 * 1024 * 1024 * 1024), // 16GB
    freemem: jest.fn().mockReturnValue(8 * 1024 * 1024 * 1024),  // 8GB
    cpus: jest.fn().mockReturnValue([
        {
            model: 'Test CPU',
            speed: 2500,
            times: { user: 1000, nice: 0, sys: 500, idle: 2000, irq: 0 }
        }
    ]),
    loadavg: jest.fn().mockReturnValue([1.5, 1.2, 1.0])
}));

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
            return result;
        })
    }))
}));

import { describe, expect, test, beforeEach } from '@jest/globals';
import { ResourceMetricsCollector } from '../../../../../../src/workflow/production/resource/metrics/resource-metrics-collector';
import { EnhancedLogger } from '../../../../../../src/utils/logger';
import * as os from 'os';


describe('ResourceMetricsCollector', () => {
    let metricsCollector: ResourceMetricsCollector;
    let mockLogger: jest.Mocked<EnhancedLogger>;
    let mockNetworkService: any;
    const TEST_NETWORK_URL = 'http://127.0.0.1:8545';

    beforeEach(() => {
        jest.clearAllMocks();

        // Mock network service
        mockNetworkService = {
            connect: jest.fn().mockResolvedValue(undefined),
            validateConnection: jest.fn().mockResolvedValue(true)
        };

        // Mock memory usage with all required properties
        const mockMemoryUsage = {
            heapUsed: 512 * 1024 * 1024,
            heapTotal: 1024 * 1024 * 1024,
            external: 100 * 1024 * 1024,
            arrayBuffers: 50 * 1024 * 1024,
            rss: 2048 * 1024 * 1024
        };
        jest.spyOn(process, 'memoryUsage').mockReturnValue(mockMemoryUsage);

        mockLogger = {
            info: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
            logOperation: jest.fn().mockImplementation((_, __, fn) => fn())
        } as any;

        metricsCollector = new ResourceMetricsCollector(
            TEST_NETWORK_URL,
            mockNetworkService,
            mockLogger
        );
    });

    describe('Initialization', () => {
        test('initializes successfully', async () => {
            await metricsCollector.initialize();
            expect(mockLogger.info).toHaveBeenCalledWith(
                'Resource metrics collector initialized successfully'
            );
        });
    });

    describe('Metrics Collection', () => {
        beforeEach(async () => {
            await metricsCollector.initialize();
        });

        test('collects complete system metrics', async () => {
            const metrics = await metricsCollector.collectMetrics();
            
            expect(metrics).toEqual({
                memory: expect.objectContaining({
                    used: expect.any(Number),
                    total: expect.any(Number),
                    percentage: expect.any(Number),
                    heapStats: expect.any(Object)
                }),
                cpu: expect.objectContaining({
                    usage: expect.any(Number),
                    loadAverage: expect.any(Array),
                    cores: expect.any(Number),
                    speed: expect.any(Number)
                }),
                disk: expect.objectContaining({
                    used: expect.any(Number),
                    available: expect.any(Number),
                    percentage: expect.any(Number)
                }),
                timestamp: expect.any(Number)
            });
        });

        test('calculates memory metrics correctly', async () => {
            const metrics = await metricsCollector.collectMetrics();
            const expectedUsed = os.totalmem() - os.freemem();
            
            expect(metrics.memory.used).toBe(expectedUsed);
            expect(metrics.memory.total).toBe(os.totalmem());
            expect(metrics.memory.percentage).toBe((expectedUsed / os.totalmem()) * 100);
        });

        test('calculates CPU metrics correctly', async () => {
            const metrics = await metricsCollector.collectMetrics();
            const cpus = os.cpus();
            
            expect(metrics.cpu.cores).toBe(cpus.length);
            expect(metrics.cpu.speed).toBe(cpus[0].speed);
            expect(metrics.cpu.loadAverage).toEqual(os.loadavg());
        });
    });

    describe('Error Handling', () => {
        test('prevents metrics collection before initialization', async () => {
            await expect(metricsCollector.collectMetrics())
                .rejects.toThrow('Metrics collector not initialized');
        });

        test('handles OS metrics collection failures', async () => {
            await metricsCollector.initialize();
            (os.cpus as jest.Mock).mockImplementationOnce(() => {
                throw new Error('CPU info unavailable');
            });
            
            await expect(metricsCollector.collectMetrics())
                .rejects.toThrow();
        });
    });
});


// npm run test -- tests/suite/workflow/production/resource/metrics/resource-metrics-collector.test.ts