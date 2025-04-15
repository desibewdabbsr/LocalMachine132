import { CompilerService } from '../../../../src/services/compiler/compiler-service';
import type { TestResult } from '../../../types';

// Define our compilation result type inline for clarity
type CompilationResult = {
    status: 'success' | 'failed';
    output?: string;
    error?: string;
};

const mockCompile = jest.fn().mockReturnValue({
    status: 'success',
    output: 'Compilation successful'
} as CompilationResult);

jest.mock('../../../../src/services/compiler/compiler-service', () => {
    return {
        CompilerService: jest.fn().mockImplementation(() => ({
            compile: mockCompile
        }))
    };
});


jest.mock('vscode', () => ({
    window: {
        withProgress: jest.fn((options, task: any) => task({ report: jest.fn() })),
        showInformationMessage: jest.fn(),
    },
    workspace: {
        findFiles: jest.fn(() => Promise.resolve([{ fsPath: '/test/Contract.sol' }]))
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
import { CompileCommand } from '../../../../src/commands/contract/compile-command';
import * as vscode from 'vscode';

describe('CompileCommand Tests', () => {
    let compileCommand: CompileCommand;
    
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
        
        compileCommand = new CompileCommand(mockContext);
        jest.clearAllMocks();
    });

    test('should compile contract successfully', async () => {
        const result = await compileCommand.execute();
        expect(mockCompile).toHaveBeenCalled();
        expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
            expect.stringContaining('Compilation successful')
        );
    });

    test('should handle missing contract files', async () => {
        jest.spyOn(vscode.workspace, 'findFiles').mockResolvedValueOnce([]);
        await expect(compileCommand.execute()).rejects.toThrow('No Solidity files found');
    });
});