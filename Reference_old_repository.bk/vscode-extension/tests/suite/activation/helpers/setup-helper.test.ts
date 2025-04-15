jest.mock('vscode', () => ({
    window: {
        withProgress: jest.fn()
    },
    ProgressLocation: {
        Notification: 1
    }
}));

import { describe, expect, test } from '@jest/globals';
import { setupTestEnvironment, createTestContext } from './setup-helper';

describe('Setup Helper', () => {
    test('creates valid test context', () => {
        const context = createTestContext();
        expect(context.extensionPath).toBe('/test/path');
        expect(context.subscriptions).toEqual([]);
        expect(context.workspaceState.get).toBeDefined();
        expect(context.globalState.update).toBeDefined();
    });

    test('sets up complete test environment', () => {
        const env = setupTestEnvironment();
        expect(env.context).toBeDefined();
        expect(env.vscode).toBeDefined();
        expect(env.logger).toBeDefined();
        expect(env.config).toBeDefined();
    });

    test('provides mock URI functionality', () => {
        const context = createTestContext();
        expect(context.extensionUri.fsPath).toBe('/test/path');
        // Fix for the undefined error
        expect(context.storageUri?.scheme).toBe('file');
    });

    test('initializes with correct mock functions', () => {
        const env = setupTestEnvironment();
        expect(typeof env.logger.debug).toBe('function');
        expect(typeof env.config.update).toBe('function');
    });
});


// npm run test:suite -- tests/suite/activation/helpers/setup-helper.test.ts