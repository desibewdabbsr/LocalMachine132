/**
 * @jest-environment jsdom
 */

jest.mock('vscode', () => ({
    window: {
        withProgress: jest.fn((options, task) => task({ 
            report: jest.fn()
        })),
        showInformationMessage: jest.fn()
    },
    ProgressLocation: {
        Notification: 1
    }
}));

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
import { ResponseProcessor } from '../../../src/integration/llama/handlers/response-processor';
import { EnhancedLogger } from '../../../src/utils/logger';

describe('ResponseProcessor', () => {
    let processor: ResponseProcessor;
    let mockLogger: jest.Mocked<EnhancedLogger>;

    beforeEach(() => {
        jest.clearAllMocks();
        mockLogger = EnhancedLogger.getInstance() as jest.Mocked<EnhancedLogger>;
        processor = new ResponseProcessor();
    });

    test('processes response correctly', async () => {
        const input = '### Response: Test response\n with multiple lines';
        const expected = 'Test response\n with multiple lines';
        
        const result = await processor.process(input);
        
        expect(result).toBe(expected);
        expect(mockLogger.debug).toHaveBeenCalledWith(
            JSON.stringify({
                message: 'Processing response',
                responseLength: input.length
            })
        );
    });

    test('handles empty response gracefully', async () => {
        const result = await processor.process('');
        
        expect(result).toBe('');
        expect(mockLogger.warn).toHaveBeenCalledWith(
            JSON.stringify({
                message: 'Empty response received',
                context: 'ResponseProcessor'
            })
        );
    });

    test('removes multiple response markers', async () => {
        const input = '### Response: ### Response: Nested response';
        const expected = 'Nested response';
        
        const result = await processor.process(input);
        
        expect(result).toBe(expected);
        expect(mockLogger.debug).toHaveBeenCalledWith(
            expect.stringContaining('Processing response')
        );
    });

    test('preserves code blocks in response', async () => {
        const input = '### Response:\n```typescript\nconst x = 1;\n```';
        const expected = '```typescript\nconst x = 1;\n```';
        
        const result = await processor.process(input);
        
        expect(result).toBe(expected);
    });
});


// npm run test -- tests/suite/llama/response-processor.test.ts