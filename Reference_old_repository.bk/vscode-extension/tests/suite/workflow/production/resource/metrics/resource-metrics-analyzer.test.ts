/**
 * @jest-environment jsdom
 */

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

import { describe, expect, test, beforeEach } from '@jest/globals';
import { ResourceMetricsAnalyzer } from '../../../../../../src/workflow/production/resource/metrics/resource-metrics-analyzer';
import { EnhancedLogger } from '../../../../../../src/utils/logger';
import { SystemMetrics, ResourceThresholds } from '../../../../../../src/workflow/production/resource/core/resource-manager-types';

describe('ResourceMetricsAnalyzer', () => {
    let analyzer: ResourceMetricsAnalyzer;
    let mockLogger: jest.Mocked<EnhancedLogger>;
    let mockNetworkService: any;
    let testThresholds: ResourceThresholds;
    const TEST_NETWORK_URL = 'http://127.0.0.1:8545';

    beforeEach(() => {
        jest.clearAllMocks();

        mockNetworkService = {
            connect: jest.fn().mockResolvedValue(undefined),
            validateConnection: jest.fn().mockResolvedValue(true)
        };

        testThresholds = {
            memory: { warning: 70, critical: 85 },
            cpu: { warning: 75, critical: 90 },
            disk: { warning: 80, critical: 95 }
        };

        mockLogger = {
            info: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
            logOperation: jest.fn().mockImplementation((_, __, fn) => fn())
        } as any;

        analyzer = new ResourceMetricsAnalyzer(
            testThresholds,
            100,
            TEST_NETWORK_URL,
            mockNetworkService,
            mockLogger
        );
    });

    describe('Initialization', () => {
        test('initializes successfully', async () => {
            await analyzer.initialize();
            expect(mockLogger.info).toHaveBeenCalledWith(
                'Resource metrics analyzer initialized successfully'
            );
        });
    });

    describe('Metrics Analysis', () => {
        beforeEach(async () => {
            await analyzer.initialize();
        });

        test('analyzes metrics correctly with healthy values', async () => {
            const testMetrics: SystemMetrics = {
                memory: { used: 5000, total: 10000, percentage: 50, heapStats: { heapUsed: 2000, heapTotal: 4000, external: 500 } },
                cpu: { usage: 60, loadAverage: [1.5, 1.2, 1.0], cores: 4, speed: 2500 },
                disk: { used: 40000, available: 60000, percentage: 40, readSpeed: 100, writeSpeed: 100 },
                timestamp: Date.now()
            };

            const analysis = await analyzer.analyzeMetrics(testMetrics);
            
            expect(analysis).toEqual({
                memory: expect.objectContaining({ status: 'healthy' }),
                cpu: expect.objectContaining({ status: 'healthy' }),
                disk: expect.objectContaining({ status: 'healthy' }),
                trends: expect.any(Object),
                timestamp: expect.any(Number),
                recommendations: expect.any(Array)
            });
        });

        test('detects critical resource usage', async () => {
            const criticalMetrics: SystemMetrics = {
                memory: { used: 9000, total: 10000, percentage: 90, heapStats: { heapUsed: 3500, heapTotal: 4000, external: 500 } },
                cpu: { usage: 95, loadAverage: [2.5, 2.2, 2.0], cores: 4, speed: 2500 },
                disk: { used: 98000, available: 100000, percentage: 98, readSpeed: 100, writeSpeed: 100 }, // Increased to 98%
                timestamp: Date.now()
            };
        
            const analysis = await analyzer.analyzeMetrics(criticalMetrics);
            
            expect(analysis.memory.status).toBe('critical');
            expect(analysis.cpu.status).toBe('critical');
            expect(analysis.disk.status).toBe('critical');
            expect(analysis.recommendations.length).toBeGreaterThan(0);
        });
        

        test('calculates trends correctly', async () => {
            // Simulate increasing memory usage
            for (let i = 0; i < 5; i++) {
                await analyzer.analyzeMetrics({
                    memory: { used: 5000 + (i * 1000), total: 10000, percentage: 50 + (i * 10), heapStats: { heapUsed: 2000, heapTotal: 4000, external: 500 } },
                    cpu: { usage: 60, loadAverage: [1.5, 1.2, 1.0], cores: 4, speed: 2500 },
                    disk: { used: 40000, available: 60000, percentage: 40, readSpeed: 100, writeSpeed: 100 },
                    timestamp: Date.now()
                });
            }

            const analysis = await analyzer.analyzeMetrics({
                memory: { used: 9000, total: 10000, percentage: 90, heapStats: { heapUsed: 2000, heapTotal: 4000, external: 500 } },
                cpu: { usage: 60, loadAverage: [1.5, 1.2, 1.0], cores: 4, speed: 2500 },
                disk: { used: 40000, available: 60000, percentage: 40, readSpeed: 100, writeSpeed: 100 },
                timestamp: Date.now()
            });

            expect(analysis.trends.memory).toBe('increasing');
        });
    });

    describe('Error Handling', () => {
        test('prevents analysis before initialization', async () => {
            const testMetrics: SystemMetrics = {
                memory: { used: 5000, total: 10000, percentage: 50, heapStats: { heapUsed: 2000, heapTotal: 4000, external: 500 } },
                cpu: { usage: 60, loadAverage: [1.5, 1.2, 1.0], cores: 4, speed: 2500 },
                disk: { used: 40000, available: 60000, percentage: 40, readSpeed: 100, writeSpeed: 100 },
                timestamp: Date.now()
            };

            await expect(analyzer.analyzeMetrics(testMetrics))
                .rejects.toThrow('Metrics analyzer not initialized');
        });
    });

    describe('Resource Status Determination', () => {
        test('correctly determines resource status thresholds', async () => {
            await analyzer.initialize();
            
            // Access private method for testing
            const determineStatus = (analyzer as any).determineResourceStatus.bind(analyzer);
    
            // Test healthy range
            expect(determineStatus(50, 70, 85)).toBe('healthy');
            
            // Test warning range
            expect(determineStatus(75, 70, 85)).toBe('warning');
            
            // Test critical range
            expect(determineStatus(90, 70, 85)).toBe('critical');
            
            // Test boundary conditions
            expect(determineStatus(70, 70, 85)).toBe('warning');  // At warning threshold
            expect(determineStatus(85, 70, 85)).toBe('critical'); // At critical threshold
        });
    });
    
});

// npm run test -- tests/suite/workflow/production/resource/metrics/resource-metrics-analyzer.test.ts