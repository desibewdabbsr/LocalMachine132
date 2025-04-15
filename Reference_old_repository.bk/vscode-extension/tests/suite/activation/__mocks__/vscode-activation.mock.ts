// tests/suite/activation/__mocks__/vscode-activation.mock.ts
import { MockVSCodeAPI } from '../../../mockes/vscode-api';

export const activationMock = {
    ProgressLocation: {
        Notification: 15,
        Window: 15
    },
    window: {
        withProgress: jest.fn((options, task) => 
            Promise.resolve(task(
                { report: jest.fn() },
                { 
                    isCancellationRequested: false, 
                    onCancellationRequested: (listener: any) => ({
                        dispose: jest.fn()
                    })
                }
            ))
        )
    },
    workspace: {
        getConfiguration: jest.fn().mockReturnValue({
            get: jest.fn().mockImplementation((key: string) => ({
                mode: 'development',
                logLevel: 'INFO',
                metricsEnabled: true
            })[key]),
            update: jest.fn().mockResolvedValue(undefined)
        })
    },
    ConfigurationTarget: {
        Global: 1,
        Workspace: 2,
        WorkspaceFolder: 3
    }
};