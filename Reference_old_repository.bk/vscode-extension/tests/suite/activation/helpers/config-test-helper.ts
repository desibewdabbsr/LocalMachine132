import * as vscode from 'vscode';

export function createConfigurationMock() {
    const mockConfig = {
        get: jest.fn(),
        update: jest.fn().mockReturnValue(Promise.resolve()),
        has: jest.fn().mockReturnValue(true),
        inspect: jest.fn()
    };

    mockConfig.get.mockImplementation((key: string) => ({
        mode: 'development',
        logLevel: 'INFO',
        metricsEnabled: true
    })[key]);

    return {
        mockConfig,
        setupWorkspaceMock: () => {
            vscode.workspace.getConfiguration = jest.fn().mockReturnValue(mockConfig);
        }
    };
}