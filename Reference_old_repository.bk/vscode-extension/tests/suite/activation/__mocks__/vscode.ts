// tests/__mocks__/vscode.ts
const mockConfiguration = {
    get: jest.fn().mockImplementation((key: string) => ({
        mode: 'development',
        logLevel: 'INFO',
        metricsEnabled: true
    })[key]),
    update: jest.fn().mockResolvedValue(undefined)
};

const vscode = {
    workspace: {
        getConfiguration: jest.fn().mockReturnValue(mockConfiguration)
    },
    ConfigurationTarget: {
        Global: 1,
        Workspace: 2,
        WorkspaceFolder: 3
    }
};

module.exports = vscode;