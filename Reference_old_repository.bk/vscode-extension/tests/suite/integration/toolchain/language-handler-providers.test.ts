jest.mock('../../../../src/utils/logger', () => ({
    EnhancedLogger: {
        getInstance: jest.fn().mockReturnValue({
            info: jest.fn(),
            error: jest.fn(),
            logOperation: jest.fn().mockImplementation((_, __, fn) => fn())
        })
    }
}));

jest.mock('vscode', () => {
    const mockDisposable = { dispose: jest.fn() };
    return {
        languages: {
            registerCompletionItemProvider: jest.fn().mockReturnValue(mockDisposable),
            registerHoverProvider: jest.fn().mockReturnValue(mockDisposable),
            registerDefinitionProvider: jest.fn().mockReturnValue(mockDisposable)
        },
        Hover: jest.fn()
    };
});

import { describe, expect, test, beforeEach } from '@jest/globals';
import { LanguageHandlerProviders } from '../../../../src/integration/toolchain/language-handler-providers';
import * as vscode from 'vscode';

describe('LanguageHandlerProviders', () => {
    let providers: LanguageHandlerProviders;
    
    beforeEach(() => {
        jest.clearAllMocks();
        providers = new LanguageHandlerProviders();
    });

    test('registers language providers successfully', async () => {
        const config = {
            id: 'solidity',
            selector: { scheme: 'file', language: 'solidity' },
            extensions: ['.sol'],
            configuration: {
                wordPattern: /[a-zA-Z]+/
            }
        };

        await providers.registerProvider(config);
        expect(vscode.languages.registerCompletionItemProvider).toHaveBeenCalled();
        expect(vscode.languages.registerHoverProvider).toHaveBeenCalled();
        expect(vscode.languages.registerDefinitionProvider).toHaveBeenCalled();
    });

    test('disposes providers correctly', async () => {
        const config = {
            id: 'solidity',
            selector: { scheme: 'file', language: 'solidity' },
            extensions: ['.sol'],
            configuration: {
                wordPattern: /[a-zA-Z]+/
            }
        };
        
        await providers.registerProvider(config);
        providers.dispose();
        expect(vscode.languages.registerCompletionItemProvider).toHaveBeenCalled();
    });
});


// npm run test:suite -- tests/suite/integration/toolchain/language-handler-providers.test.ts