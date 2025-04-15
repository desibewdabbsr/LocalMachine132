/**
 * @jest-environment jsdom
 */

global.fetch = jest.fn();

const mockLogger = {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    logOperation: jest.fn().mockImplementation((_, __, fn) => fn())
};

jest.mock('../../../src/utils/logger', () => ({
    EnhancedLogger: {
        getInstance: jest.fn().mockReturnValue(mockLogger)
    }
}));

import { describe, expect, test, beforeEach, afterEach } from '@jest/globals';
import { LlamaConnectionManager } from '../../../src/integration/llama/core/connection-manager';

describe('LlamaConnectionManager', () => {
    let connectionManager: LlamaConnectionManager;
    
    beforeEach(() => {
        jest.clearAllMocks();
        (global.fetch as jest.Mock).mockClear();
        connectionManager = new LlamaConnectionManager();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test('verifies connection successfully', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });
        const result = await connectionManager.verifyConnection();
        expect(result).toBe(true);
        expect(global.fetch).toHaveBeenCalledWith('http://localhost:11434/api/tags');
    });

    test('handles failed connection attempts', async () => {
        (global.fetch as jest.Mock).mockRejectedValue(new Error('Connection failed'));
        const result = await connectionManager.verifyConnection();
        expect(result).toBe(false);
    }, 5000);

    test('sends request successfully', async () => {
        const mockResponse = { ok: true, json: () => Promise.resolve({ data: 'test' }) };
        (global.fetch as jest.Mock)
            .mockResolvedValueOnce({ ok: true })
            .mockResolvedValueOnce(mockResponse);
        
        const response = await connectionManager.sendRequest('/test', { data: 'payload' });
        expect(response).toBe(mockResponse);
    });

    test('handles request timeout', async () => {
        jest.useFakeTimers();
        (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });
        const requestPromise = connectionManager.sendRequest('/test', {});
        jest.advanceTimersByTime(120000);
        await expect(requestPromise).rejects.toThrow();
    });

    test('handles connection verification failure before request', async () => {
        const mockFetch = global.fetch as jest.Mock;
        mockFetch.mockRejectedValueOnce(new Error('Connection failed'))
                .mockRejectedValueOnce(new Error('Connection failed'))
                .mockRejectedValueOnce(new Error('Connection failed'));

        const promise = connectionManager.sendRequest('/test', {});
        await expect(promise).rejects.toThrow('Cannot establish connection to Ollama service');
    }, 20000);
});