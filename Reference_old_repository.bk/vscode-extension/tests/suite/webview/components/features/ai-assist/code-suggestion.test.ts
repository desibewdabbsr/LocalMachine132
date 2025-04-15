/**
 * @jest-environment jsdom
 */

jest.mock('vscode');
jest.mock('../../../../../../src/utils/logger', () => ({
    EnhancedLogger: {
        getInstance: jest.fn().mockReturnValue({
            info: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
            logOperation: jest.fn().mockImplementation((_, __, fn) => fn()),
            logSecurityAudit: jest.fn(),
            getConfig: jest.fn().mockReturnValue({
                logLevel: 'INFO',
                mode: 'development'
            })
        })
    }
}));


import { describe, expect, test, beforeEach } from '@jest/globals';
import { CodeSuggestionService } from '../../../../../../webview/components/features/ai-assist/code-suggestion';
import { AIOrchestrator, AIRequest, AIResponse } from '../../../../../../src/integration/ai/ai-orchestrator-bridge';
import { CodyEngineConnector, CodyRequest, CodyResponse } from '../../../../../../src/integration/ai/ml-engine-connector';
import { EnhancedLogger } from '../../../../../../src/utils/logger';

describe('CodeSuggestionService', () => {
    let codeSuggestionService: CodeSuggestionService;
    let mockAIOrchestrator: jest.Mocked<AIOrchestrator>;
    let mockMLEngine: jest.Mocked<CodyEngineConnector>;

    beforeEach(() => {
        // Initialize mocks before each test
        mockAIOrchestrator = {
            initialize: jest.fn().mockResolvedValue(undefined),
            processRequest: jest.fn().mockResolvedValue({ type: 'success', data: {} }),
            initializeProject: jest.fn()
        } as unknown as jest.Mocked<AIOrchestrator>;
    
        mockMLEngine = {
            process: jest.fn().mockResolvedValue({
                text: JSON.stringify(['suggestion1']),
                tokens: 100,
                modelVersion: '1.0'
            }),
            validateConnection: jest.fn()
        } as unknown as jest.Mocked<CodyEngineConnector>;
    
        codeSuggestionService = new CodeSuggestionService(mockAIOrchestrator, mockMLEngine);
        // Initialize the service
        codeSuggestionService['isInitialized'] = true;
    });
    

    test('generates code suggestions', async () => {
        const context = 'function transfer';
        const mockSuggestions = ['suggestion1', 'suggestion2'];
        
        (mockMLEngine.process as jest.Mock).mockResolvedValue({
            text: JSON.stringify(mockSuggestions),
            tokens: 100,
            modelVersion: '1.0',
            metadata: { confidence: 0.9 }
        });

        const result = await codeSuggestionService.getSuggestions(context);
        expect(result).toEqual(mockSuggestions);
    });

    test('handles context analysis', async () => {
        const code = 'contract Token {';
        const mockAnalysis = { type: 'contract', context: 'ERC20' };
        
        (mockAIOrchestrator.processRequest as jest.Mock).mockResolvedValue(mockAnalysis);
        
        const result = await codeSuggestionService.analyzeContext(code);
        expect(result).toEqual(mockAnalysis);
    });

    test('processes real-time suggestions', async () => {
        const input = 'function';
        (mockMLEngine.process as jest.Mock).mockResolvedValue({
            text: 'transfer(address to, uint256 amount)',
            tokens: 50,
            modelVersion: '1.0',
            metadata: { confidence: 0.95 }
        });

        const result = await codeSuggestionService.getRealTimeSuggestion(input);
        expect(result).toContain('transfer');
    });

    test('handles suggestion errors gracefully', async () => {
        (mockMLEngine.process as jest.Mock).mockRejectedValue(new Error('API Error'));
        
        await expect(codeSuggestionService.getSuggestions('context'))
            .rejects
            .toThrow('Failed to generate suggestions');
    });
});


// npm run test -- tests/suite/webview/components/features/ai-assist/code-suggestion.test.ts