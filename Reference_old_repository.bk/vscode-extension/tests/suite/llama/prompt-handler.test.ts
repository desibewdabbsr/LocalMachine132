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
            logOperation: jest.fn().mockImplementation((_, __, fn) => fn()),
            getConfig: jest.fn().mockReturnValue({
                logLevel: 'INFO',
                mode: 'development'
            })
        })
    }
}));

import { describe, expect, test, beforeEach } from '@jest/globals';
import { PromptHandler } from '../../../src/integration/llama/handlers/prompt-handler';
import { EnhancedLogger } from '../../../src/utils/logger';

describe('PromptHandler', () => {
    let handler: PromptHandler;
    let mockLogger: jest.Mocked<EnhancedLogger>;

    beforeEach(() => {
        jest.clearAllMocks();
        mockLogger = EnhancedLogger.getInstance() as jest.Mocked<EnhancedLogger>;
        handler = new PromptHandler();
    });

    test('formats prompt correctly', async () => {
        const input = 'Test prompt with code:\n```typescript\nconst x = 1;\n```';
        const result = await handler.process(input);
        
        expect(result).toContain('### Input:');
        expect(result).toContain('### Response:');
        expect(result).toContain('```typescript\nconst x = 1;\n```');
        expect(mockLogger.debug).toHaveBeenCalledWith(
            JSON.stringify({
                message: 'Processing prompt',
                inputLength: input.length
            })
        );
    });

    test('handles empty input gracefully', async () => {
        const result = await handler.process('');
        
        expect(result).toBe('### Input:\n\n### Response:');
        expect(mockLogger.warn).toHaveBeenCalledWith(
            JSON.stringify({
                message: 'Empty prompt received',
                context: 'PromptHandler'
            })
        );
    });

    test('preserves multiline content', async () => {
        const input = 'Line 1\nLine 2\nLine 3';
        const result = await handler.process(input);
        
        expect(result).toContain('Line 1\nLine 2\nLine 3');
        expect(result.split('\n').length).toBeGreaterThan(3);
    });

    test('handles special characters', async () => {
        const input = 'Test with @#$%^&*()';
        const result = await handler.process(input);
        
        expect(result).toContain(input);
        expect(mockLogger.debug).toHaveBeenCalledWith(
            expect.stringContaining('Processing prompt')
        );
    });
});


// npm run test -- tests/suite/llama/prompt-handler.test.ts