// tests/suite/activation/__mocks__/vscode.mock.ts
import * as vscode from 'vscode';

const mockProgress = { report: jest.fn() };
const mockToken = {
    isCancellationRequested: false,
    onCancellationRequested: jest.fn(() => ({ dispose: jest.fn() }))
};

export const mockVSCode = {
    window: {
        withProgress: jest.fn().mockImplementation((options, task) => 
            Promise.resolve(task(mockProgress, mockToken))
        )
    },
    ProgressLocation: {
        Notification: 1
    }
};






// Dedicated mock file for activation-init.test.ts