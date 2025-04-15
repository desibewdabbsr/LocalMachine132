// First define the MockVSCodeAPI class
class MockVSCodeAPI {
    private state: unknown = {};

    public getState<T>(): T {
        return this.state as T;
    }

    public setState<T>(state: T): void {
        this.state = state;
    }

    public postMessage<T>(message: T): void {
        console.log('Mock VSCode message:', message);
    }
}

// Then use it in VSCodeWrapper
export class VSCodeWrapper {
    private vscode: any;

    constructor() {
        this.vscode = typeof acquireVsCodeApi === 'function' 
            ? acquireVsCodeApi() 
            : new MockVSCodeAPI();
    }

    public getState<T>(): T {
        return this.vscode.getState();
    }

    public setState<T>(state: T): void {
        this.vscode.setState(state);
    }

    public postMessage<T>(message: T): void {
        this.vscode.postMessage(message);
    }
}