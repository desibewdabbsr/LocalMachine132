jest.mock('vscode', () => ({
    window: {
        createWebviewPanel: jest.fn().mockReturnValue({
            webview: {
                html: '',
                onDidReceiveMessage: jest.fn(),
                postMessage: jest.fn()
            },
            onDidDispose: jest.fn(),
            reveal: jest.fn(),
            dispose: jest.fn()
        }),
        withProgress: jest.fn()
    },
    ViewColumn: {
        One: 1,
        Two: 2
    },
    Uri: {
        file: jest.fn(path => ({ fsPath: path })),
        parse: jest.fn()
    }
}));

import { describe, expect, test, beforeEach } from '@jest/globals';
import { WebviewManager } from '../../src/webview/webview-manager';
import { createTestContext } from './activation/helpers/setup-helper';
import * as vscode from 'vscode';


describe('Webview Panel', () => {
    let webviewManager: WebviewManager;
    let context: vscode.ExtensionContext;

    beforeEach(() => {
        context = createTestContext();
        webviewManager = new WebviewManager(context);
    });

    test('creates and shows webview panel', () => {
        const panel = webviewManager.createWebviewPanel('test-view', 'Test View');
        expect(vscode.window.createWebviewPanel).toHaveBeenCalled();
        expect(panel).toBeDefined();
    });

    test('handles webview messages', async () => {
        const panel = webviewManager.createWebviewPanel('test-view', 'Test View');
        const message = { command: 'test', data: {} };
        await webviewManager.postMessage(panel, message);
        expect(panel.webview.postMessage).toHaveBeenCalledWith(message);
    });

    test('manages webview lifecycle', () => {
        const panel = webviewManager.createWebviewPanel('test-view', 'Test View');
        webviewManager.dispose();
        expect(panel.dispose).toHaveBeenCalled();
    });
});


// npm run test:suite -- tests/suite/webview-manager-panel.test.ts