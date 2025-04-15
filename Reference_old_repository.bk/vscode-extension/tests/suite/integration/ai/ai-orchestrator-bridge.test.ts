jest.mock('../../../../src/utils/logger', () => ({
    EnhancedLogger: {
        getInstance: jest.fn().mockReturnValue({
            info: jest.fn(),
            debug: jest.fn(),
            error: jest.fn(),
            logOperation: jest.fn().mockImplementation(async (_, __, fn) => fn())
        })
    }
}));

import { describe, expect, test, beforeEach } from '@jest/globals';
import { AIOrchestrator } from '../../../../src/integration/ai/ai-orchestrator-bridge';
import { ExtensionConfig } from '../../../types';
import { EnhancedLogger } from '../../../../src/utils/logger';

describe('AIOrchestrator', () => {
    let aiOrchestrator: AIOrchestrator;
    let mockLogger: jest.Mocked<any>;
    let config: ExtensionConfig;

    beforeEach(() => {
        mockLogger = EnhancedLogger.getInstance() as jest.Mocked<any>;
        aiOrchestrator = new AIOrchestrator();
        
        // Reset all mocks before each test
        jest.clearAllMocks();
    

        config = {
            mode: 'development',
            metricsEnabled: true,
            mockEnabled: false,
            mockResponsePath: 'tests/fixtures/responses',
            logLevel: 'INFO',
            retentionDays: 30,
            security: {
                analysisEnabled: true,
                vulnerabilityScanLevel: 'deep',
                autoFix: false
            },
            cody: {
                endpoint: 'http://localhost:3000',
                timeout: 30000,
                retryAttempts: 3
            },
            toolchain: {
                rust: {
                    channel: 'stable',
                    components: ['rustfmt', 'clippy']
                },
                solidity: {
                    version: '0.8.19',
                    optimizer: true
                }
            }
        };

        aiOrchestrator = new AIOrchestrator();
    });

    test('processes AI requests successfully', async () => {
        const request = {
            type: 'code-suggestion',
            context: 'function transfer'
        };

        const response = await aiOrchestrator.processRequest(request);
        expect(response.type).toBe('code-suggestion');
    });

    test('initializes project successfully', async () => {
        await aiOrchestrator.initializeProject(config);
        expect(mockLogger.info).toHaveBeenCalledWith('Starting AI-driven project initialization');
    });

    test('handles component initialization', async () => {
        await aiOrchestrator.initialize();
        expect(mockLogger.info).toHaveBeenCalledWith('AI Orchestrator initialized successfully');
    });
});



// npm run test -- tests/suite/integration/ai/ai-orchestrator-bridge.test.ts