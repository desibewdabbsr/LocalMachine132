/**
 * @jest-environment jsdom
 */

jest.mock('vscode', () => ({
    window: {
        withProgress: jest.fn((options, task) => task({ report: jest.fn() })),
        showInformationMessage: jest.fn()
    },
    ProgressLocation: {
        Notification: 1
    }
}));

jest.mock('../../../../../../src/utils/logger', () => ({
    EnhancedLogger: {
        getInstance: jest.fn().mockReturnValue({
            info: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
            logOperation: jest.fn().mockImplementation(async (_, __, fn) => fn()),
            logSecurityAudit: jest.fn(),
            getConfig: jest.fn().mockReturnValue({
                logLevel: 'INFO',
                mode: 'development'
            })
        })
    }
}));

import { describe, expect, test, beforeEach } from '@jest/globals';
import { SecurityChecker, SecurityCheckResult } from '../../../../../../webview/components/features/security/security-checker';
import { SecurityService } from '../../../../../../src/services/security-service';
import { CodyEngineConnector } from '../../../../../../src/integration/ai/ml-engine-connector';

describe('SecurityChecker', () => {
    let securityChecker: SecurityChecker;
    let mockSecurityService: jest.Mocked<SecurityService>;
    let mockMLEngine: jest.Mocked<CodyEngineConnector>;

    beforeEach(() => {
        mockSecurityService = {
            validateDeployment: jest.fn().mockResolvedValue({ status: 'success' })
        } as unknown as jest.Mocked<SecurityService>;

        mockMLEngine = {
            process: jest.fn().mockResolvedValue({
                text: JSON.stringify({ issues: [] }),
                tokens: 100,
                modelVersion: '1.0',
                metadata: { confidence: 0.95 }
            }),
            validateConnection: jest.fn().mockResolvedValue(true)
        } as unknown as jest.Mocked<CodyEngineConnector>;

        securityChecker = new SecurityChecker(mockSecurityService, mockMLEngine);
    });

    test('initializes successfully', async () => {
        await securityChecker.initialize();
        expect(mockMLEngine.validateConnection).toHaveBeenCalled();
    });

    test('analyzes code successfully', async () => {
        await securityChecker.initialize();
        const result = await securityChecker.analyzeCode('contract Test {}');
        
        expect(result).toEqual(expect.objectContaining({
            status: 'safe',
            issues: expect.any(Array),
            metrics: expect.objectContaining({
                score: expect.any(Number),
                confidence: expect.any(Number),
                processingTime: expect.any(Number)
            })
        }));
    });

    test('handles initialization failure', async () => {
        mockMLEngine.validateConnection.mockRejectedValue(new Error('Connection failed'));
        await expect(securityChecker.initialize()).rejects.toThrow('Failed to initialize security checker');
    });

    test('prevents analysis before initialization', async () => {
        // Don't initialize the security checker
        const result = securityChecker.analyzeCode('contract Test {}');
        await expect(result).rejects.toThrow('Security checker not initialized');
    });
    

    test('handles analysis errors gracefully', async () => {
        await securityChecker.initialize();
        mockMLEngine.process.mockRejectedValue(new Error('Analysis failed'));
        const result = securityChecker.analyzeCode('contract Test {}');
        await expect(result).rejects.toThrow('Failed to perform security analysis');
    });
});


// npm run test -- tests/suite/webview/components/features/security/security-checker.test.ts