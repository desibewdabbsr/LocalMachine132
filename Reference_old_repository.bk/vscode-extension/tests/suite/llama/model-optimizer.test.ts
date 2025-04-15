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
import { ModelOptimizer } from '../../../src/integration/llama/optimization/model-optimizer';
import { EnhancedLogger } from '../../../src/utils/logger';
import type { ModelConfig } from '../../../src/integration/llama/types';

describe('ModelOptimizer', () => {
    let optimizer: ModelOptimizer;
    let mockLogger: jest.Mocked<EnhancedLogger>;
    let baseConfig: ModelConfig;

    beforeEach(() => {
        jest.clearAllMocks();
        mockLogger = EnhancedLogger.getInstance() as jest.Mocked<EnhancedLogger>;
        optimizer = new ModelOptimizer();
        
        baseConfig = {
            batchSize: 16,
            quantization: 'fp32',
            threadCount: 4,
            memoryLimit: 4096,
            contextLength: 2048
        };
    });

    test('optimizes configuration based on hardware', () => {
        const modelId = 'test-model';
        const optimizedConfig = optimizer.optimizeForInference(modelId, baseConfig);
        
        expect(optimizedConfig.batchSize).toBeLessThanOrEqual(baseConfig.batchSize);
        expect(optimizedConfig.threadCount).toBeLessThanOrEqual(4);
        expect(mockLogger.debug).toHaveBeenCalledWith(
            expect.stringContaining('"message":"Starting model optimization"')
        );
    });

    test('tracks optimization history', () => {
        const modelId = 'test-model';
        optimizer.optimizeForInference(modelId, baseConfig);
        
        const history = optimizer.getOptimizationHistory(modelId);
        expect(history).toHaveLength(1);
        expect(history[0]).toHaveProperty('timestamp');
        expect(history[0]).toHaveProperty('metrics');
    });

    test('handles memory constraints', () => {
        const lowMemoryConfig = { ...baseConfig, memoryLimit: 2048 };
        const optimizedConfig = optimizer.optimizeForInference('test-model', lowMemoryConfig);
        
        expect(optimizedConfig.batchSize).toBeLessThanOrEqual(8);
        expect(optimizedConfig.quantization).toBe('int8');
    });
});


// npm run test -- tests/suite/llama/model-optimizer.test.ts