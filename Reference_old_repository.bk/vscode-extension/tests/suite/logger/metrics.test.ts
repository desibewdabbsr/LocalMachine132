import { describe, expect, test, beforeEach, jest } from '@jest/globals';
import type { MetricEntry, MockFsModule } from '../../../src/utils/logger/types';

// Mock setup before imports
jest.mock('fs-extra', () => ({
    writeJSON: jest.fn(() => Promise.resolve()),
    readJSON: jest.fn(() => Promise.resolve([])),
    appendFile: jest.fn(() => Promise.resolve()),
    ensureDir: jest.fn(() => Promise.resolve()),
    ensureDirSync: jest.fn()
}));

// Import after mock setup
import { MetricsLogger } from '../../../src/utils/logger/metrics';

describe('MetricsLogger', () => {
    let logger: MetricsLogger;
    let mockFs: MockFsModule;

    beforeEach(() => {
        jest.clearAllMocks();
        mockFs = require('fs-extra');
        const mockMetrics = [{
            timestamp: new Date().toISOString(),
            metrics: {
                startTime: Date.now(),
                endTime: Date.now(),
                duration: 100,
                success: true,
                metadata: {
                    operation: 'test'
                }
            }
        }] as MetricEntry[];
        
        mockFs.readJSON.mockResolvedValue(mockMetrics);
        logger = new MetricsLogger({
            logLevel: 'INFO',
            retentionDays: 30,
            metricsEnabled: true
        });
    });

    test('logs metrics successfully', async () => {
        const result = await logger.logOperation('test', 'operation', async () => 'result');
        expect(result).toBe('result');
        expect(mockFs.writeJSON).toHaveBeenCalled();
    });

    test('tracks performance metrics', async () => {
        const result = await logger.logOperation('test', 'performance', async () => {
            return 'performance test';
        });
        expect(result).toBe('performance test');
        expect(mockFs.writeJSON).toHaveBeenCalledWith(
            expect.stringContaining('test-performance'),
            expect.arrayContaining([
                expect.objectContaining({
                    metrics: expect.objectContaining({
                        success: true
                    })
                })
            ]),
            expect.anything()
        );
    });




    test('handles failed operations', async () => {
        const error = new Error('Test error');
        await expect(logger.logOperation(
            'test',
            'failedOp',
            async () => { throw error; }
        )).rejects.toThrow(error);
    
        expect(mockFs.writeJSON).toHaveBeenCalledWith(
            expect.any(String),
            expect.arrayContaining([
                expect.objectContaining({
                    metrics: expect.objectContaining({
                        success: false,
                        error: expect.any(Error)
                    })
                })
            ]),
            expect.anything()
        );
    });



    test('logs operation metrics', async () => {
        const result = await logger.logOperation('test', 'operation', async () => 'result');
        expect(result).toBe('result');
        expect(mockFs.writeJSON).toHaveBeenCalled();
    });




    test('logs failed operation metrics', async () => {
        const error = new Error('Test error');
        await expect(logger.logOperation(
            'test',
            'failedOp',
            async () => { throw error; }
        )).rejects.toThrow(error);

        expect(mockFs.writeJSON).toHaveBeenCalledWith(
            expect.any(String),
            expect.arrayContaining([
                expect.objectContaining({
                    metrics: expect.objectContaining({
                        success: false,
                        error: expect.any(Error)
                    })
                })
            ]),
            expect.anything()
        );
    });


    test('tracks memory snapshots accurately', () => {
        const startMemory = 1000;
        const endMemory = 2000;
        
        jest.spyOn(process, 'memoryUsage').mockImplementation(() => ({
            heapUsed: startMemory,
            heapTotal: 0,
            external: 0,
            arrayBuffers: 0,
            rss: 0
        }));
        
        logger.takeMemorySnapshot('start');
        
        jest.spyOn(process, 'memoryUsage').mockImplementation(() => ({
            heapUsed: endMemory,
            heapTotal: 0,
            external: 0,
            arrayBuffers: 0,
            rss: 0
        }));
        
        logger.takeMemorySnapshot('end');
        
        const delta = logger.getMemoryDelta('start', 'end');
        expect(delta).toBe(endMemory - startMemory);
    });

    test('handles missing memory snapshots', () => {
        const delta = logger.getMemoryDelta('nonexistent1', 'nonexistent2');
        expect(delta).toBe(0);
    });


    test('maintains metrics file structure', async () => {
        await logger.logOperation('test', 'structure', async () => 'data');
        expect(mockFs.writeJSON).toHaveBeenCalledWith(
            expect.stringContaining('test-structure'),
            expect.arrayContaining([
                expect.objectContaining({
                    metrics: expect.objectContaining({
                        success: true
                    })
                })
            ]),
            expect.anything()
        );
    });
});






/*
# Test all logger modules
npm run test:suite -- tests/suite/logger/*.test.ts

# Test specific module
npm run test:suite -- tests/suite/logger/core.test.ts
npm run test:suite -- tests/suite/logger/metrics.test.ts
npm run test:suite -- tests/suite/logger/security.test.ts
npm run test:suite -- tests/suite/logger/index.test.ts
*/