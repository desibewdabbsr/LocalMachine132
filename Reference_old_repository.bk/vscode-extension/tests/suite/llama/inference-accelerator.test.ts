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
import { InferenceAccelerator } from '../../../src/integration/llama/optimization/inference-accelerator';
import { EnhancedLogger } from '../../../src/utils/logger';
import type { AccelerationConfig } from '../../../src/integration/llama/types';

describe('InferenceAccelerator', () => {
    let accelerator: InferenceAccelerator;
    let mockLogger: jest.Mocked<EnhancedLogger>;
    let baseConfig: AccelerationConfig;

    beforeEach(async () => {
        jest.clearAllMocks();
        mockLogger = EnhancedLogger.getInstance() as jest.Mocked<EnhancedLogger>;
        accelerator = new InferenceAccelerator();
        await accelerator.initialize();
        
        baseConfig = {
            batchSize: 16,
            temperature: 0.7,
            cacheTTL: 3600000
        };
    });

    test('accelerates inference with caching', async () => {
        const input = 'test input';
        
        // First call
        const result1 = await accelerator.accelerateInference(input, baseConfig);
        
        // Second call should hit cache
        const result2 = await accelerator.accelerateInference(input, baseConfig);
        
        expect(result1).toBe(result2);
        expect(mockLogger.debug).toHaveBeenCalledWith(
            expect.stringContaining('Processing inference')
        );
    });


    test('handles cache expiration', async () => {
        const input = 'test input';
        const shortTTLConfig = { ...baseConfig, cacheTTL: -1 }; // Force cache expiration
        
        const result1 = await accelerator.accelerateInference(input, shortTTLConfig);
        await new Promise(resolve => setTimeout(resolve, 10)); // Ensure timestamp difference
        const result2 = await accelerator.accelerateInference(input, shortTTLConfig);
        
        expect(result1).not.toBe(result2);
    });

    test('tracks performance metrics', async () => {
        const input = 'test input';
        await accelerator.accelerateInference(input, baseConfig);
        
        const metrics = accelerator.getMetrics();
        expect(metrics.get('inference')).toBeDefined();
        expect(metrics.get('inference')![0]).toHaveProperty('duration');
    });

    test('handles errors gracefully', async () => {
        const invalidConfig = { ...baseConfig, batchSize: -1 };
        
        await expect(
            accelerator.accelerateInference('test', invalidConfig)
        ).rejects.toThrow();
    });
});


// npm run test -- tests/suite/llama/inference-accelerator.test.ts