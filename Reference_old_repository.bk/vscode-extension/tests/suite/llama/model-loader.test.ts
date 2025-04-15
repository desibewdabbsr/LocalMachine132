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
import { ModelLoader } from '../../../src/integration/llama/core/model-loader';
import { EnhancedLogger } from '../../../src/utils/logger';
import type { ModelResponse, GenerationOptions } from '../../../src/integration/llama/types';

describe('ModelLoader', () => {
    let loader: ModelLoader;
    let mockLogger: jest.Mocked<EnhancedLogger>;

    beforeEach(() => {
        jest.clearAllMocks();
        mockLogger = EnhancedLogger.getInstance() as jest.Mocked<EnhancedLogger>;
        loader = new ModelLoader(mockLogger);
    });

    test('loads model successfully', async () => {
        const modelName = 'llama2-7b';
        await loader.loadModel(modelName);
        
        expect(mockLogger.info).toHaveBeenCalledWith(
            expect.stringContaining('"message":"Model loaded successfully"')
        );
        expect(mockLogger.info).toHaveBeenCalledWith(
            expect.stringContaining('"modelName":"llama2-7b"')
        );
        expect(mockLogger.info).toHaveBeenCalledWith(
            expect.stringMatching(/"metrics":\{"loadTimeMs":\d+(\.\d+)?\}/)
        );
    });

    test('handles model loading errors', async () => {
        const modelName = 'invalid-model';
        await expect(loader.loadModel(modelName)).rejects.toThrow('Model not found');
    });

    test('generates response with metrics', async () => {
        const prompt = 'Test prompt';
        const config: GenerationOptions = {
            temperature: 0.7,
            maxLength: 100
        };
        
        await loader.loadModel('llama2-7b');
        const response = await loader.generate(prompt, config);
        
        expect(response).toHaveProperty('text');
        expect(response).toHaveProperty('tokens');
        expect(response).toHaveProperty('metadata.confidence');
        expect(response).toHaveProperty('metadata.processingTime');
    });

    test('caches loaded models', async () => {
        const modelName = 'llama2-7b';
        
        await loader.loadModel(modelName);
        await loader.loadModel(modelName);
        
        expect(mockLogger.info).toHaveBeenCalledWith(
            expect.stringContaining('"message":"Model already loaded"')
        );
    });

    test('handles generation without loaded model', async () => {
        const prompt = 'Test prompt';
        await expect(loader.generate(prompt, {})).rejects.toThrow('No model loaded');
    });
});


// npm run test -- tests/suite/llama/model-loader.test.ts