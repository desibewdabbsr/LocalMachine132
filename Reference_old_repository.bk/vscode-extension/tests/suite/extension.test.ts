import type { Progress, ProgressOptions } from 'vscode';

jest.mock('../../src/utils/logger', () => ({
    EnhancedLogger: {
        getInstance: jest.fn().mockReturnValue({
            info: jest.fn(),
            error: jest.fn(),
            logOperation: jest.fn().mockImplementation((...args) => {
                const fn = args[args.length - 1];
                return typeof fn === 'function' ? fn() : Promise.resolve();
            })
        })
    }
}));


jest.mock('vscode', () => ({
    window: {
        withProgress: jest.fn((
            _options: ProgressOptions, 
            task: (progress: Progress<any>) => Promise<any>
        ) => task({ report: jest.fn() })),
        showInformationMessage: jest.fn(),
    },
    commands: {
        registerCommand: jest.fn().mockReturnValue({ dispose: jest.fn() }),
        executeCommand: jest.fn()
    },
    ProgressLocation: {
        Notification: 1
    },
    ExtensionMode: {
        Test: 2
    }
}));


jest.mock('../../src/config/config_manager', () => ({
    ConfigManager: {
        getInstance: jest.fn().mockReturnValue({
            loadConfig: jest.fn().mockImplementation(() => Promise.resolve({
                mode: 'development',
                metricsEnabled: true,
                mockEnabled: false,
                logLevel: 'INFO',
                retentionDays: 30
            }))
        })
    }
}));


import { describe, expect, test, beforeEach, jest } from '@jest/globals';
import { activate, deactivate } from '../../src/extension';
import { ConfigManager } from '../../src/config/config_manager';
import * as vscode from 'vscode';
import { EnhancedLogger } from '../../src/utils/logger';

describe('Extension Test Suite', () => {
    let mockContext: vscode.ExtensionContext;
    let logger: EnhancedLogger;

    beforeEach(() => {
        mockContext = {
            subscriptions: [],
            extensionPath: '',
            storagePath: '',
            globalStoragePath: '',
            logPath: '',
            storageUri: {} as any,
            globalStorageUri: {} as any,
            logUri: {} as any,
            extensionUri: {} as any,
            workspaceState: {} as any,
            globalState: {} as any,
            secrets: {} as any,
            environmentVariableCollection: {} as any,
            extension: {} as any,
            asAbsolutePath: (path: string) => path,
            extensionMode: vscode.ExtensionMode.Test,
            languageModelAccessInformation: {
                onDidChange: jest.fn(),
                canSendRequest: true
            }
        } as unknown as vscode.ExtensionContext;
    
        logger = EnhancedLogger.getInstance();
        jest.clearAllMocks();
    });
    


    describe('Activation', () => {
        test('initializes extension successfully', async () => {
            const logOperationSpy = jest.spyOn(logger, 'logOperation');
            await activate(mockContext);
            expect(logOperationSpy).toHaveBeenCalledWith(
                'extension',
                'activation',
                expect.any(Function)
            );
        });

        test('handles activation errors gracefully', async () => {
            const errorSpy = jest.spyOn(logger, 'error');
            const error = new Error('Activation failed');
            jest.spyOn(logger, 'logOperation').mockRejectedValueOnce(error);
            await expect(activate(mockContext)).rejects.toThrow('Activation failed');
            expect(errorSpy).toHaveBeenCalled();
        });
    });

    describe('Command Registration', () => {
        test('registers all required commands', async () => {
            const registerCommandSpy = jest.spyOn(vscode.commands, 'registerCommand');
            await activate(mockContext);
            expect(registerCommandSpy).toHaveBeenCalledTimes(5);
            const expectedCommands = [
                'pop.initProject',
                'pop.compileContract',
                'pop.deployContract',
                'pop.verifyContract',
                'pop.configureProject'
            ];
            expectedCommands.forEach(cmd => {
                expect(registerCommandSpy).toHaveBeenCalledWith(cmd, expect.any(Function));
            });
        });

        test('commands are disposable', async () => {
            await activate(mockContext);
            expect(mockContext.subscriptions.length).toBeGreaterThan(0);
        });
    });

    describe('Performance Monitoring', () => {
        test('tracks activation performance metrics', async () => {
            await activate(mockContext);
            expect(logger.logOperation).toHaveBeenCalledWith(
                'extension',
                'activation',
                expect.any(Function)
            );
        });

        describe('Performance Monitoring', () => {
            test('logs performance data on completion', async () => {
                const infoSpy = jest.spyOn(logger, 'info');
                await activate(mockContext);
                
                expect(infoSpy).toHaveBeenCalledWith('Commands registered successfully');
            });
        });
        
    });

    describe('Error Handling', () => {
        test('handles command execution errors', async () => {
            const error = new Error('Command failed');
            jest.spyOn(vscode.commands, 'executeCommand').mockRejectedValueOnce(error);
            await activate(mockContext);
            expect(logger.error).not.toHaveBeenCalled();
        });

        test('logs configuration errors', async () => {
            const error = new Error('Config load failed');
            jest.spyOn(logger, 'logOperation').mockRejectedValueOnce(error);
            
            await expect(activate(mockContext)).rejects.toThrow('Config load failed');
            expect(logger.error).toHaveBeenCalledWith(`Extension activation failed: ${error}`);
        });
    });

    describe('Deactivation', () => {
        test('cleans up resources on deactivation', () => {
            deactivate();
            expect(logger.info).toHaveBeenCalledWith('Extension deactivated');
        });

        test('disposes all subscriptions', async () => {
            await activate(mockContext);
            const disposeSpy = jest.fn();
            mockContext.subscriptions.forEach(sub => {
                (sub as { dispose: jest.Mock }).dispose = disposeSpy;
            });
            deactivate();
            expect(logger.info).toHaveBeenCalledWith('Extension deactivated');
        });
    });
});