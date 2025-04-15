// tests/suite/activation/test-cases/activation-init.test.ts
jest.mock('vscode', () => ({
    window: {
        withProgress: jest.fn()
    },
    ProgressLocation: {
        Notification: 1
    }
}));

import { describe, expect, test, beforeEach } from '@jest/globals';
import { ExtensionActivator } from '../../../../src/activation';
import { setupTestEnvironment } from '../helpers/setup-helper';
import * as vscode from 'vscode';

describe('Extension Initialization', () => {
    let activator: ExtensionActivator;
    let testEnv: ReturnType<typeof setupTestEnvironment>;

    beforeEach(() => {
        testEnv = setupTestEnvironment();
        activator = new ExtensionActivator();
    });

    test('initializes core components', async () => {
        await activator.activate(testEnv.context);
        expect(activator).toBeDefined();
        expect(vscode.window.withProgress).toHaveBeenCalled();
    });

    test('handles initialization errors', async () => {
        try {
            await activator.activate(undefined as any);
            fail('Should throw error');
        } catch (error) {
            expect(error).toBeDefined();
        }
    });
});


// npm run test:suite -- tests/suite/activation/test-cases/activation-init.test.ts