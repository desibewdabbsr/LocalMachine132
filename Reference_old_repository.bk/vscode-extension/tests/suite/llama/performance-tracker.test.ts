/**
 * @jest-environment jsdom
 */

jest.mock('../../../src/utils/logger', () => ({
    EnhancedLogger: {
        getInstance: jest.fn().mockReturnValue({
            info: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn()
        })
    }
}));

import { describe, expect, test, beforeEach } from '@jest/globals';
import { PerformanceTracker } from '../../../src/integration/llama/optimization/performance-tracker';
import { EnhancedLogger } from '../../../src/utils/logger';
import type { OperationResult } from '../../../src/integration/llama/types';  // Added import

describe('PerformanceTracker', () => {
    let tracker: PerformanceTracker;
    let mockLogger: jest.Mocked<EnhancedLogger>;

    beforeEach(() => {
        jest.clearAllMocks();
        mockLogger = EnhancedLogger.getInstance() as jest.Mocked<EnhancedLogger>;
        tracker = new PerformanceTracker();
    });

    test('tracks operation performance successfully', async () => {
        const operationId = 'test-operation';
        const result = await tracker.trackOperation(operationId, async () => {
            await new Promise(resolve => setTimeout(resolve, 100));
            return 'success';
        });

        expect(result.success).toBe(true);
        expect(result.result).toBe('success');
        expect(result.metrics).toBeDefined();
        expect(result.metrics.duration).toBeGreaterThan(0);
        expect(mockLogger.debug).toHaveBeenCalledWith(
            expect.stringContaining('Started performance tracking')
        );
    });

    test('prevents duplicate operation tracking', async () => {
        const operationId = 'duplicate-test';
        const operation = async () => {
            await new Promise(resolve => setTimeout(resolve, 50));
            return true;
        };

        // Start first operation
        const promise1 = tracker.trackOperation(operationId, operation);
        
        // Attempt to start duplicate operation
        await expect(
            tracker.trackOperation(operationId, operation)
        ).rejects.toThrow('Operation duplicate-test is already being tracked');

        await promise1;
    });

    test('handles operation failures gracefully', async () => {
        const operationId = 'failed-operation';
        const error = new Error('Operation failed');

        await expect(
            tracker.trackOperation(operationId, async () => {
                throw error;
            })
        ).rejects.toThrow('Operation failed');

        expect(mockLogger.error).toHaveBeenCalled();
        expect(tracker.getActiveOperations()).not.toContain(operationId);
    });

    test('maintains metrics history within limits', async () => {
        const operationId = 'repeated-operation';
        
        for (let i = 0; i < 1100; i++) {
            await tracker.trackOperation(operationId, async () => i);
        }

        const metrics = tracker.getMetrics(operationId);
        expect(metrics.length).toBeLessThanOrEqual(1000);
        expect(metrics[metrics.length - 1].operationId).toBe(operationId);
    });

    test('tracks memory usage correctly', async () => {
        const operationId = 'memory-test';
        const result = await tracker.trackOperation(operationId, async () => {
            const array = new Array(1000000).fill(0);
            return array.length;
        });

        expect(result.metrics.memoryUsage.heapUsed).toBeGreaterThan(0);
        expect(result.metrics.memoryUsage.heapTotal).toBeGreaterThan(0);
    });


    test('handles concurrent operations', async () => {
        const operations = ['op1', 'op2', 'op3'].map(id => 
            tracker.trackOperation(id, async () => {
                await new Promise(resolve => setTimeout(resolve, 50));
                return id;
            })
        );

        const results = await Promise.all(operations);
        results.forEach((result: OperationResult<string>, index: number) => {
            expect(result.success).toBe(true);
            expect(result.result).toBe(`op${index + 1}`);
        });
    });

    test('clears metrics successfully', async () => {
        const operationId = 'clear-test';
        await tracker.trackOperation(operationId, async () => 'test');
        
        tracker.clearMetrics(operationId);
        expect(tracker.getMetrics(operationId)).toHaveLength(0);
        expect(mockLogger.warn).not.toHaveBeenCalled();
    });

    test('warns when clearing non-existent metrics', () => {
        const nonExistentId = 'non-existent';
        tracker.clearMetrics(nonExistentId);
        expect(mockLogger.warn).toHaveBeenCalledWith(
            expect.stringContaining('Attempting to clear non-existent metrics')
        );
    });
});


// npm run test -- tests/suite/llama/performance-tracker.test.ts