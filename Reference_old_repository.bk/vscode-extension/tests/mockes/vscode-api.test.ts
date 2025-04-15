import { describe, expect, test } from '@jest/globals';
import { MockVSCodeAPI, mockVSCodeAPI } from './vscode-api';

describe('VSCode API Mock', () => {
    describe('MockVSCodeAPI', () => {
        test('should manage state correctly', () => {
            const api = new MockVSCodeAPI();
            const testState = { data: 'test' };
            api.setState(testState);
            expect(api.getState()).toEqual(testState);
        });
    });

    describe('mockVSCodeAPI', () => {
        test('commands.registerCommand returns disposable', () => {
            const disposable = mockVSCodeAPI.commands.registerCommand('test', () => {});
            expect(disposable.dispose).toBeDefined();
        });

        test('window.withProgress executes task', async () => {
            const task = jest.fn();
            await mockVSCodeAPI.window.withProgress({}, task);
            expect(task).toHaveBeenCalled();
        });

        test('window.createOutputChannel returns channel', () => {
            const channel = mockVSCodeAPI.window.createOutputChannel('test');
            expect(channel.appendLine).toBeDefined();
            expect(channel.show).toBeDefined();
        });
    });
});



// npm run test:suite -- tests/mockes/vscode-api.test.ts
