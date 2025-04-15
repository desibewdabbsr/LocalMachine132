import * as vscode from 'vscode';
import { ActivationTestContext } from '../types/activation-types';
import { activationMock } from '../__mocks__/vscode-activation.mock';

const mockUri = {
    file: (path: string): vscode.Uri => ({
        path,
        scheme: 'file',
        fsPath: path,
        authority: '',
        query: '',
        fragment: '',
        with: () => mockUri.file(path),
        toJSON: () => ({ scheme: 'file', path }),
        toString: () => `file://${path}`
    } as vscode.Uri)
};
export const createTestContext = (): ActivationTestContext => ({
    extensionPath: '/test/path',
    extensionUri: mockUri.file('/test/path'),
    storagePath: '/test/storage/path',
    globalStoragePath: '/test/global/storage/path',
    logPath: '/test/log/path',
    subscriptions: [],
    workspaceState: {
        get: jest.fn(),
        update: jest.fn(),
        keys: jest.fn()
    },
    globalState: {
        get: jest.fn(),
        update: jest.fn(),
        keys: jest.fn(),
        setKeysForSync: jest.fn()
    },
    secrets: {
        get: jest.fn(),
        store: jest.fn(),
        delete: jest.fn(),
        onDidChange: jest.fn()
    },
    extensionMode: 1,
    environmentVariableCollection: {
        persistent: true,
        replace: jest.fn(),
        append: jest.fn(),
        prepend: jest.fn(),
        get: jest.fn(),
        forEach: jest.fn(),
        delete: jest.fn(),
        clear: jest.fn(),
        description: undefined,
        getScoped: jest.fn(),
        [Symbol.iterator]: jest.fn()
    },
    asAbsolutePath: (relativePath: string) => `/test/path/${relativePath}`,
    storageUri: mockUri.file('/test/storage'),
    globalStorageUri: mockUri.file('/test/global-storage'),
    logUri: mockUri.file('/test/log'),
    extensionRuntime: 1,
    // Adding the missing properties
    extension: {
        id: 'test-extension',
        extensionUri: mockUri.file('/test/path'),
        extensionPath: '/test/path',
        isActive: true,
        packageJSON: {},
        exports: undefined,
        activate: jest.fn(),
        extensionKind: 1
    },
    languageModelAccessInformation: {
        onDidChange: jest.fn(),
        canSendRequest: () => true
    }
});


export function setupTestEnvironment() {
    return {
        context: createTestContext(),
        vscode: activationMock,
        logger: {
            debug: jest.fn(),
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn()
        },
        config: {
            get: jest.fn(),
            update: jest.fn()
        }
    };
}



// npm run test:suite -- tests/suite/activation/helpers/setup-helper.test.ts