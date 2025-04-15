/**
 * @jest-environment jsdom
 */

jest.mock('../../../src/utils/logger', () => ({
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
import { LlamaEngine } from '../../../src/integration/llama/core/llama-engine';
import { EnhancedLogger } from '../../../src/utils/logger';
import type { LlamaConfig } from '../../../src/integration/llama/types';

describe('LlamaEngine', () => {
    let engine: LlamaEngine;
    let mockLogger: jest.Mocked<EnhancedLogger>;
    let mockConfig: LlamaConfig;

    beforeEach(() => {
        jest.clearAllMocks();
        mockLogger = EnhancedLogger.getInstance() as jest.Mocked<EnhancedLogger>;
        
        mockConfig = {
            modelName: 'llama2-7b',
            contextSize: 2048,
            temperature: 0.7,
            maxTokens: 512,
            cpuThreads: 4,
            batchSize: 512
        };
        
        engine = new LlamaEngine(mockConfig);
    });

    test('initializes with hardware-optimized configuration', async () => {
        await engine.initialize();
        expect(mockLogger.info).toHaveBeenCalledWith(
            expect.stringContaining('"message":"Engine initialized successfully"')
        );
    });

    test('generates response with proper processing flow', async () => {
        const input = 'Test prompt';
        await engine.initialize();
        const response = await engine.generate(input);
        
        expect(response).toBeDefined();
        expect(mockLogger.debug).toHaveBeenCalledWith(
            expect.stringContaining('"message":"Generation completed"')
        );
    });

    test('handles initialization errors', async () => {
        mockConfig.modelName = 'invalid-model';
        engine = new LlamaEngine(mockConfig);
        
        await expect(engine.initialize()).rejects.toThrow();
    });

    test('optimizes configuration based on hardware', () => {
        const config = engine.getConfig();
        expect(config.cpuThreads).toBeLessThanOrEqual(navigator.hardwareConcurrency || 4);
        expect(config.contextSize).toBeLessThanOrEqual(2048);
    });
});


// npm run test -- tests/suite/llama/llama-engine.test.ts 