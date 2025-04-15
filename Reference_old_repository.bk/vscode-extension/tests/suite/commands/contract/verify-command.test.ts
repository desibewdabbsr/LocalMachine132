jest.mock('vscode', () => ({
    window: {
        withProgress: jest.fn((options, task: any) => task({ report: jest.fn() })),
        showInformationMessage: jest.fn(),
        showQuickPick: jest.fn(() => Promise.resolve('local'))
    },
    ProgressLocation: {
        Notification: 1
    },
    ExtensionMode: {
        Test: 2,
        Development: 1,
        Production: 3
    }
}));

import { describe, expect, test, beforeEach, jest } from '@jest/globals';
import { VerifyCommand } from '../../../../src/commands/contract/verify-command';
import * as vscode from 'vscode';
import { ethers } from 'ethers';

describe('VerifyCommand Tests', () => {
    let verifyCommand: VerifyCommand;
    
    beforeEach(() => {
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
        
        verifyCommand = new VerifyCommand(mockContext);
    });

    test('should verify contract successfully', async () => {
        const contractInfo = {
            address: '0x123',
            constructorArguments: []
        };

        await verifyCommand.execute(contractInfo);
        expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
            expect.stringContaining('Contract verified successfully:')
        );
    });

    test('should handle network selection cancellation', async () => {
        jest.spyOn(vscode.window, 'showQuickPick').mockResolvedValueOnce(undefined);
        const contractInfo = {
            address: '0x123',
            constructorArguments: []
        };

        await expect(verifyCommand.execute(contractInfo)).rejects.toThrow('Network selection cancelled');
    });
});


// npm run test:suite -- tests/suite/commands/contract/verify-command.test.ts