import { describe, expect, test, beforeEach, jest } from '@jest/globals';
import { vscode, createMockFunction, createMockOutputChannel } from './vscode.mock';
import { Progress, ProgressOptions, OutputChannel, MockFunction } from '../types';

describe('VSCode Mock', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('createMockFunction creates callable mock with tracking', () => {
        const mock = createMockFunction();
        mock('test');
        expect(mock).toHaveBeenCalledWith('test');
        expect(mock).toHaveBeenCalledTimes(1);
    });

    test('createMockOutputChannel creates channel with all required methods', () => {
        const channel = createMockOutputChannel('test');
        expect(channel.name).toBe('test');
        expect(typeof channel.appendLine).toBe('function');
        expect(typeof channel.show).toBe('function');
        expect(typeof channel.dispose).toBe('function');
    });

    test('window.createOutputChannel creates mockable output channel', () => {
        const channel = vscode.window.createOutputChannel('test');
        channel.appendLine('message');
        expect(channel.appendLine).toHaveBeenCalledWith('message');
        expect(channel.appendLine).toHaveBeenCalledTimes(1);
    });

    test('window.withProgress executes callback with progress object', async () => {
        const progressCallback = jest.fn();
        
        await vscode.window.withProgress(
            { location: vscode.ProgressLocation.Notification } as ProgressOptions,
            async (progress: Progress<{ message: string }>) => {
                progress.report({ message: 'test' });
                progressCallback();
            }
        );

        expect(progressCallback).toHaveBeenCalled();
    });
});