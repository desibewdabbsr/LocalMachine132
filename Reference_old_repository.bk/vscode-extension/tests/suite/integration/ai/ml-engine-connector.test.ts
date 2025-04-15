/**
 * @jest-environment node
 */

jest.mock('vscode', () => ({
    window: {
        withProgress: jest.fn((options, task) => task({ report: jest.fn() }))
    },
    ProgressLocation: {
        Notification: 1
    }
}));

jest.mock('../../../../src/utils/logger', () => ({
    EnhancedLogger: {
        getInstance: jest.fn().mockReturnValue({
            info: jest.fn(),
            error: jest.fn(),
            logOperation: jest.fn().mockImplementation(async (_: string, __: string, fn: () => Promise<any>) => fn())
        })
    }
}));

import { describe, expect, test, beforeEach } from '@jest/globals';
import { CodyEngineConnector } from '../../../../src/integration/ai/ml-engine-connector';
import type { CodyConfig } from '../../../../src/integration/ai/ml-engine-connector';

describe('CodyEngineConnector', () => {
    let connector: CodyEngineConnector;
    let mockConfig: CodyConfig;
    let originalFetch: typeof global.fetch;

    beforeEach(() => {
        mockConfig = {
            authToken: 'sgp_fd1b4edb60bf82b8_25160fe1b70894533a193b9e3ff79f3aa2058454',
            apiEndpoint: 'https://sourcegraph.com/.api/graphql',
            modelVersion: 'cody-v1',
            maxTokens: 2048,
            temperature: 0.7,
            retryAttempts: 3,
            timeout: 30000
        };

        originalFetch = global.fetch;
        global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;
        connector = new CodyEngineConnector(mockConfig);
    });

    afterEach(() => {
        global.fetch = originalFetch;
        jest.clearAllMocks();
    });

    test('processes Cody request successfully', async () => {
        const mockResponse = {
            data: {
                completion: {
                    text: 'Generated code response',
                    tokens: 150,
                    metadata: {
                        confidence: 0.95,
                        processingTime: 0.5
                    }
                }
            }
        };

        (global.fetch as jest.MockedFunction<typeof fetch>)
            .mockResolvedValueOnce(new Response(JSON.stringify(mockResponse), { status: 200 }));

        const result = await connector.process({
            query: 'Write a test for this function',
            context: 'function add(a, b) { return a + b; }'
        });

        expect(result.text).toBe('Generated code response');
        expect(result.modelVersion).toBe(mockConfig.modelVersion);
    });

    test('handles API errors gracefully', async () => {
        (global.fetch as jest.MockedFunction<typeof fetch>)
            .mockResolvedValueOnce(new Response('', { status: 401 }));

        await expect(connector.process({
            query: 'Test query'
        })).rejects.toThrow('Request failed with status 401');
    });

    test('validates connection successfully', async () => {
        (global.fetch as jest.MockedFunction<typeof fetch>)
            .mockResolvedValueOnce(new Response('', { status: 200 }));

        const isValid = await connector.validateConnection();
        expect(isValid).toBe(true);
    });
});


// npm run test:suite -- tests/suite/integration/ai/ml-engine-connector.test.ts