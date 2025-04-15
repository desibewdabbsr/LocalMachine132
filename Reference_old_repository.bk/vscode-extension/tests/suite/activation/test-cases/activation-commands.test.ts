

jest.mock('vscode', () => ({
    window: {
        withProgress: jest.fn((options, task) => task({ report: jest.fn() }))
    },
    ProgressLocation: {
        Notification: 1
    },
    commands: {
        registerCommand: jest.fn().mockReturnValue({
            dispose: jest.fn()
        }),
        executeCommand: jest.fn()
    }
}));

import { describe, expect, test, beforeEach } from '@jest/globals';
import * as vscode from 'vscode';
import { CommandManager } from '../../../../src/commands/command-manager';
import { createTestContext } from '../helpers/setup-helper';
import { EnhancedLogger } from '../../../../src/utils/logger';

describe('Command Registration', () => {
    let commandManager: CommandManager;
    let logger: EnhancedLogger;
    let context: vscode.ExtensionContext;

    beforeEach(() => {
        context = createTestContext();
        logger = EnhancedLogger.getInstance();
        commandManager = new CommandManager(context, logger);
    });

    test('registers commands successfully', () => {
        const testCommand = {
            id: 'pop-dev-assistant.testCommand',
            execute: async () => {}
        };

        commandManager.registerCommand(testCommand);
        expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
            testCommand.id,
            testCommand.execute
        );
    });

    test('executes registered commands', async () => {
        const mockExecute = jest.fn();
        const testCommand = {
            id: 'pop-dev-assistant.testCommand',
            execute: mockExecute
        };

        commandManager.registerCommand(testCommand);
        await commandManager.executeCommand(testCommand.id);
        expect(mockExecute).toHaveBeenCalled();
    });

    test('handles command errors', async () => {
        await expect(
            commandManager.executeCommand('nonexistent.command')
        ).rejects.toThrow('Command not found');
    });

    test('disposes commands properly', () => {
        const testCommand = {
            id: 'pop-dev-assistant.testCommand',
            execute: async () => {}
        };

        commandManager.registerCommand(testCommand);
        commandManager.dispose();
        expect(commandManager['commands'].size).toBe(0);
    });
});





// // npm run test:suite -- tests/suite/activation/test-cases/activation-commands.test.ts 
