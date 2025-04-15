jest.mock('vscode', () => ({
    window: {
        withProgress: jest.fn((options, task: any) => task({ report: jest.fn() })),
        showInformationMessage: jest.fn(),
        showQuickPick: jest.fn().mockImplementation(() => Promise.resolve({ label: '' })),
        showInputBox: jest.fn().mockImplementation(() => Promise.resolve()),
        showTextDocument: jest.fn()
    },
    workspace: {
        workspaceFolders: [{ uri: { fsPath: '/test/workspace' } }],
        openTextDocument: jest.fn().mockImplementation(() => Promise.resolve({}))
    },
    ProgressLocation: {
        Notification: 1
    },
    ExtensionMode: {
        Test: 2
    }
}));

jest.mock('fs-extra', () => ({
    readJSON: jest.fn().mockImplementation(() => Promise.resolve()),
    writeJSON: jest.fn().mockImplementation(() => Promise.resolve())
}));

import { describe, expect, test, beforeEach, jest } from '@jest/globals';
import { ConfigCommand } from '../../../../src/commands/projects/config-command';
import * as vscode from 'vscode';
import * as fs from 'fs-extra';

describe('ConfigCommand Tests', () => {
    let configCommand: ConfigCommand;
    const mockConfig = {
        name: 'test-project',
        version: '1.0.0',
        networks: {
            local: 'http://localhost:8545'
        },
        compiler: {
            version: '0.8.0',
            optimizer: {
                enabled: true,
                runs: 200
            }
        }
    };

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

        configCommand = new ConfigCommand(mockContext);
        (fs.readJSON as jest.MockedFunction<typeof fs.readJSON>).mockResolvedValue(mockConfig);
        (fs.writeJSON as jest.MockedFunction<typeof fs.writeJSON>).mockResolvedValue();
    });

    test('views configuration successfully', async () => {
        (vscode.window.showQuickPick as jest.MockedFunction<typeof vscode.window.showQuickPick>)
            .mockResolvedValue({ label: 'View Configuration' });
        await configCommand.execute();
        expect(vscode.workspace.openTextDocument).toHaveBeenCalled();
    });

    test('updates network configuration', async () => {
        (vscode.window.showQuickPick as jest.MockedFunction<typeof vscode.window.showQuickPick>)
            .mockResolvedValue({ label: 'Update Networks' });
        (vscode.window.showInputBox as jest.MockedFunction<typeof vscode.window.showInputBox>)
            .mockResolvedValueOnce('testnet')
            .mockResolvedValueOnce('https://testnet.example.com');

        await configCommand.execute();

        expect(fs.writeJSON).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                networks: expect.objectContaining({
                    testnet: 'https://testnet.example.com'
                })
            }),
            { spaces: 2 }
        );
    });

    test('updates compiler settings', async () => {
        (vscode.window.showQuickPick as jest.MockedFunction<typeof vscode.window.showQuickPick>)
            .mockResolvedValueOnce({ label: 'Update Compiler Settings' })
            .mockResolvedValueOnce({ label: 'Yes' });
        (vscode.window.showInputBox as jest.MockedFunction<typeof vscode.window.showInputBox>)
            .mockResolvedValue('0.8.1');

        await configCommand.execute();

        expect(fs.writeJSON).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                compiler: {
                    version: '0.8.1',
                    optimizer: {
                        enabled: true,
                        runs: 200
                    }
                }
            }),
            { spaces: 2 }
        );
    });
});


// npm run test:suite -- tests/suite/commands/projects/config-command.test.ts