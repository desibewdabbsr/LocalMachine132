// File: pop-dev-assistant/vscode-extension/tests/suite/integration/toolchain/language-handler.test.ts

import { describe, expect, test, beforeEach, jest } from '@jest/globals';
import { LanguageHandler } from '../../../../src/integration/toolchain/language-handler';
import { EnhancedLogger } from '../../../../src/utils/logger';

describe('LanguageHandler', () => {
    let languageHandler: LanguageHandler;
    let mockLogger: jest.Mocked<EnhancedLogger>;

    beforeEach(() => {
        mockLogger = {
            info: jest.fn(),
            debug: jest.fn(),
            error: jest.fn(),
            getInstance: jest.fn()
        } as any;

        (EnhancedLogger as any).getInstance = jest.fn(() => mockLogger);
        languageHandler = new LanguageHandler();
    });

    test('initializes language support successfully', async () => {
        await languageHandler.initialize();
        
        expect(mockLogger.info).toHaveBeenCalledWith('Initializing Language Handler');
        expect(mockLogger.debug).toHaveBeenCalledTimes(4); // Four languages
        expect(mockLogger.info).toHaveBeenCalledWith('Language Handler initialized successfully');
    });

    test('handles language configuration errors', async () => {
        mockLogger.debug.mockImplementationOnce(() => {
            throw new Error('Language configuration failed');
        });

        await expect(languageHandler.initialize()).rejects.toThrow('Language configuration failed');
    });

    test('configures all supported languages', async () => {
        await languageHandler.initialize();
        
        const supportedLanguages = ['Solidity', 'Rust', 'TypeScript', 'Python'];
        supportedLanguages.forEach(lang => {
            expect(mockLogger.debug).toHaveBeenCalledWith(`Configuring language support: ${lang}`);
        });
    });

    test('generates smart contract successfully', async () => {
        await languageHandler.generateSmartContract();
        
        expect(mockLogger.info).toHaveBeenCalledWith('Starting smart contract generation');
        expect(mockLogger.info).toHaveBeenCalledWith('Contract generation completed');
    });

    test('handles contract generation process', async () => {
        const generateSpy = jest.spyOn(languageHandler as any, 'generateContract');
        await languageHandler.generateSmartContract();
        expect(generateSpy).toHaveBeenCalled();
    });
});



// npm run test:suite -- tests/suite/integration/toolchain/language-handler.test.ts