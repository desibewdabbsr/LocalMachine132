export interface VSCodeAPI {
    getState<T>(): T;
    setState<T>(state: T): void;
    postMessage<T>(message: T): void;
}

export class MockVSCodeAPI implements VSCodeAPI {
    private state: unknown = {};

    public getState<T>(): T {
        return this.state as T;
    }

    public setState<T>(state: T): void {
        this.state = state;
    }

    public postMessage<T>(message: T): void {
        // We'll leave this empty as we're mocking the interface
    }
}



export const mockVSCodeAPI = {
    commands: {
        registerCommand: jest.fn().mockReturnValue({
            dispose: jest.fn()
        }),
        executeCommand: jest.fn()
    },
    window: {
        withProgress: jest.fn().mockImplementation((_, task) => task({ report: jest.fn() })),
        createOutputChannel: jest.fn().mockReturnValue({
            appendLine: jest.fn(),
            show: jest.fn()
        })
    },
    ProgressLocation: {
        Notification: 1
    }
};



// npm run test:suite -- tests/mockes/vscode-api.test.ts