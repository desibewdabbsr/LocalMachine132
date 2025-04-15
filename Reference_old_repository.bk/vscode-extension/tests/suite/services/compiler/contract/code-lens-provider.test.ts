jest.mock('vscode', () => ({
    window: {
        withProgress: jest.fn((options, task) => task({ report: jest.fn() }))
    },
    ProgressLocation: {
        Notification: 1
    },
    ExtensionMode: {
        Test: 2,
        Development: 1,
        Production: 3
    },
    CodeLens: jest.fn().mockImplementation(function(range, command) {
        return { range, command };
    })
}));


jest.mock('../../../../../src/utils/logger', () => ({
    EnhancedLogger: {
        getInstance: jest.fn().mockReturnValue({
            info: jest.fn(),
            error: jest.fn(),
            logOperation: jest.fn(async (_, __, fn) => fn())
        })
    }
}));

jest.mock('../../../../../src/services/service-manager', () => ({
    ServiceManager: {
        initialize: jest.fn().mockResolvedValue({})
    }
}));

import { describe, expect, test, beforeEach } from '@jest/globals';
import { ContractCodeLensProvider } from '../../../../../src/services/compiler/contract/code-lens-provider';
import * as vscode from 'vscode';

describe('ContractCodeLensProvider', () => {
    let provider: ContractCodeLensProvider;
    let document: vscode.TextDocument;

    beforeEach(() => {
        jest.clearAllMocks();
        const mockContext: vscode.ExtensionContext = {
            extensionPath: '',
            subscriptions: [],
            workspaceState: {} as any,
            globalState: {} as any,
            extensionUri: {} as any,
            storageUri: {} as any,
            logUri: {} as any,
            globalStorageUri: {} as any,
            secrets: {} as any,
            environmentVariableCollection: {} as any,
            asAbsolutePath: (relativePath: string) => relativePath,
            storagePath: '',
            logPath: '',
            extensionMode: vscode.ExtensionMode.Test,
            globalStoragePath: '',
            extension: {} as any,
            languageModelAccessInformation: {} as any
        };

        provider = new ContractCodeLensProvider(mockContext);
        document = {
            getText: jest.fn().mockReturnValue(
                'function transfer(address to, uint256 amount) public {}'
            ),
            positionAt: jest.fn().mockReturnValue({ line: 0, character: 0 }),
            getWordRangeAtPosition: jest.fn().mockReturnValue({
                start: { line: 0, character: 0 },
                end: { line: 0, character: 8 }
            })
        } as any;
    });

    test('provides code lenses for contract functions', async () => {
        const codeLenses = await provider.provideCodeLenses(
            document,
            {} as vscode.CancellationToken
        );

        expect(codeLenses).toHaveLength(1);
        expect(codeLenses[0].command).toEqual({
            title: '▶ Test Function',
            command: 'pop.testFunction',
            arguments: ['transfer']
        });
    });

    test('handles analysis progress correctly', async () => {
        await provider.provideCodeLenses(
            document,
            {} as vscode.CancellationToken
        );

        expect(vscode.window.withProgress).toHaveBeenCalledWith(
            expect.objectContaining({
                location: vscode.ProgressLocation.Notification,
                title: 'Analyzing Smart Contract'
            }),
            expect.any(Function)
        );
    });
});


// npm run test -- tests/suite/services/compiler/contract/code-lens-provider.test.ts