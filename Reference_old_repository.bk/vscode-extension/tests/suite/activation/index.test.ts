const mockCommandRegistration = {
    dispose: jest.fn()
};

jest.mock('vscode', () => ({
    window: {
        withProgress: jest.fn((options, task) => task({ report: jest.fn() }))
    },
    ProgressLocation: {
        Notification: 1
    },
    commands: {
        registerCommand: jest.fn().mockReturnValue(mockCommandRegistration),
        executeCommand: jest.fn().mockResolvedValue(undefined)
    },
    EventEmitter: jest.fn(),
    Disposable: {
        from: jest.fn().mockReturnValue({
            dispose: jest.fn()
        })
    }
}));

import { describe } from '@jest/globals';
import * as vscode from 'vscode';

// Mock setup for command registration
(vscode.commands as any).registerCommand = jest.fn().mockReturnValue(mockCommandRegistration);

describe('Extension Activation Suite', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    require('./test-cases/activation-init.test');
    require('./test-cases/activation-config.test');
    require('./test-cases/activation-services.test');
    require('./test-cases/activation-commands.test');
    require('./test-cases/activation-cleanup.test');
    require('./test-cases/config-update.test');
});
