import { MockFunction, OutputChannel } from '../types';

export const createMockFunction = (): MockFunction => {
    const mock = jest.fn() as MockFunction;
    mock.calls = [];
    mock.mockReturnValue = function(value) {
        jest.fn().mockReturnValue(value);
        return this;
    };
    mock.mockImplementation = function(implementation) {
        jest.fn().mockImplementation(implementation);
        return this;
    };
    return mock;
};

export const createMockOutputChannel = (name: string): OutputChannel => ({
    name,
    appendLine: jest.fn(),
    append: jest.fn(),
    clear: jest.fn(),
    show: jest.fn(),
    hide: jest.fn(),
    dispose: jest.fn()
});



export const vscode = {
    workspace: {
        getConfiguration: jest.fn().mockReturnValue({
            get: jest.fn(),
            update: jest.fn(),
            inspect: jest.fn()
        }),
        workspaceFolders: [],
        onDidChangeConfiguration: jest.fn()
    },
    commands: {
        registerCommand: jest.fn().mockImplementation((command, callback) => ({
            dispose: jest.fn()
        })),
        executeCommand: jest.fn()
    },
    window: {
        withProgress: jest.fn().mockImplementation(async (options, task) => {
            return task({ report: jest.fn() });
        }),
        createOutputChannel: jest.fn().mockReturnValue({
            appendLine: jest.fn(),
            show: jest.fn()
        })
    },
    ProgressLocation: {
        Notification: 1
    },


};



// npm run test:mockes
