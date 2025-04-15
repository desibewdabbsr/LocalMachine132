// tests/suite/activation/__mocks__/config-update.mock.ts
import * as vscode from 'vscode';

export interface ConfigUpdateHandler {
    workspace: {
        getConfiguration: jest.Mock;
    };
    ConfigurationTarget: {
        Global: number;
        Workspace: number;
        WorkspaceFolder: number;
    };
}

// Export the mock handler
export const mockConfigHandler: ConfigUpdateHandler = {
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
