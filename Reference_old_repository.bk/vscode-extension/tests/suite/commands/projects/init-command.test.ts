jest.mock('vscode', () => ({
    window: {
        withProgress: jest.fn((options, task: any) => task({ report: jest.fn() })),
        showInformationMessage: jest.fn()
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

jest.mock('fs-extra', () => ({
    copy: jest.fn(),
    writeJSON: jest.fn()
}));

import { describe, expect, test, beforeEach, jest } from '@jest/globals';
import { InitCommand } from '../../../../src/commands/projects/init-command';
import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import * as path from 'path';

describe('InitCommand Tests', () => {
    let initCommand: InitCommand;
    
    beforeEach(() => {
        (fs.copy as jest.Mock).mockImplementation(() => Promise.resolve());
        (fs.writeJSON as jest.Mock).mockImplementation(() => Promise.resolve());
        
        const mockContext: vscode.ExtensionContext = {
            extensionPath: '/test/extension/path',
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
        
        initCommand = new InitCommand(mockContext);
    });

    test('should initialize project successfully', async () => {
        const projectPath = '/test/project';
        await initCommand.execute(projectPath);
        
        expect(fs.copy).toHaveBeenCalledWith(
            path.join('/test/extension/path', 'templates'),
            projectPath
        );
        
        expect(fs.writeJSON).toHaveBeenCalledWith(
            path.join(projectPath, 'config.json'),
            expect.objectContaining({
                name: 'project',
                version: '1.0.0',
                networks: expect.any(Object)
            }),
            { spaces: 2 }
        );
    });
});