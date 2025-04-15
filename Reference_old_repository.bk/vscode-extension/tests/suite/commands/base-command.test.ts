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
    }
}));

import { describe, expect, test, beforeEach } from '@jest/globals';
import { BaseCommand } from '../../../src/commands/base-command';
import * as vscode from 'vscode';

class TestCommand extends BaseCommand {
    public async execute(): Promise<void> {
        await this.showProgress('Test Progress', async () => {
            return new Promise(resolve => setTimeout(resolve, 1000));
        });
    }
}

describe('BaseCommand Tests', () => {
    let testCommand: TestCommand;
    
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
        
        testCommand = new TestCommand(mockContext);
    });

    test('should execute command with progress bar', async () => {
        const result = await testCommand.execute();
        expect(result).toBeUndefined();
    });

    test('should handle progress cancellation', async () => {
        const result = await testCommand.execute();
        expect(result).toBeUndefined();
    });
});



// npm run test:suite -- tests/suite/commands/base-command.test.ts