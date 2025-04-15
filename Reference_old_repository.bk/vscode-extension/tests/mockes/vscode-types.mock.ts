import { jest } from '@jest/globals';
import type { MockFunction } from '../types';

// Add these type definitions at the top
type GetMutator = (variable: string) => EnvironmentVariableMutator | undefined;
type GetScoped = (scope: any) => GlobalEnvironmentVariableCollection;

interface EnvironmentVariableMutatorOptions {
    scope?: any;
    applyAtShell?: boolean;
    applyAtProcessCreation?: boolean;
}



export enum EnvironmentVariableMutatorType {
    Replace = 1,
    Append = 2,
    Prepend = 3
}


interface Extension<T> {
    id: string;
    extensionPath: string;
    isActive: boolean;
    packageJSON: any;
    extensionUri: Uri;
    extensionKind: ExtensionKind;
    exports: T;
    activate: () => Promise<T>;
}

export enum ExtensionKind {
    UI = 1,
    Workspace = 2
}

interface EnvironmentVariableMutator {
    type: EnvironmentVariableMutatorType; // Update to use enum
    value: string;
    options: EnvironmentVariableMutatorOptions;
}


interface GlobalEnvironmentVariableCollection extends Iterable<[string, EnvironmentVariableMutator]> {
    persistent: boolean;
    description: string; // Make description required
    getScoped(scope: any): GlobalEnvironmentVariableCollection;
    append(variable: string, value: string): void;
    prepend(variable: string, value: string): void;
    replace(variable: string, value: string): void;
    remove(variable: string): void;
    clear(): void;
    forEach(callback: (variable: string, mutator: EnvironmentVariableMutator, collection: GlobalEnvironmentVariableCollection) => any): void;
    delete(variable: string): void;
    get(variable: string): EnvironmentVariableMutator | undefined;
}



// Core interfaces
interface Memento {
    get<T>(key: string): T | undefined;
    update(key: string, value: any): Promise<void>;
    keys(): readonly string[];
}

// Add Event type
type Event<T> = (listener: (e: T) => any) => { dispose(): any };

// Add SecretStorageChangeEvent interface
interface SecretStorageChangeEvent {
    key: string;
}

// Update SecretStorage interface
interface SecretStorage {
    get(key: string): Thenable<string | undefined>;
    store(key: string, value: string): Thenable<void>;
    delete(key: string): Thenable<void>;
    onDidChange: Event<SecretStorageChangeEvent>;
}


interface EnvironmentVariableCollection {
    persistent: boolean;
    replace(variable: string, value: string): void;
    clear(): void;
}








export class Uri {
    constructor(
        public scheme: string,
        public authority: string,
        public path: string,
        public query: string = '',
        public fragment: string = ''
    ) {}


    get fsPath(): string {
        return this.path;
    }

    with(change: { 
        scheme?: string;
        authority?: string;
        path?: string;
        query?: string;
        fragment?: string;
    }): Uri {
        return new Uri(
            change.scheme || this.scheme,
            change.authority || this.authority,
            change.path || this.path,
            change.query || this.query,
            change.fragment || this.fragment
        );
    }

    toJSON(): any {
        return {
            scheme: this.scheme,
            authority: this.authority,
            path: this.path,
            query: this.query,
            fragment: this.fragment,
            fsPath: this.fsPath
        };
    }

    public static file(path: string): Uri {
        return new Uri('file', '', path);
    }

    public static parse(value: string): Uri {
        const url = new URL(value);
        return new Uri(
            url.protocol.replace(':', ''),
            url.host,
            url.pathname,
            url.search.replace('?', ''),
            url.hash.replace('#', '')
        );
    }

    public toString(): string {
        return `${this.scheme}://${this.authority}${this.path}`;
    }
}







export interface ExtensionContext {
    subscriptions: Array<{ dispose(): any }>;
    extensionPath: string;
    extensionUri: Uri;
    storageUri: Uri;
    globalStorageUri: Uri;
    logUri: Uri;
    storagePath: string;
    globalStoragePath: string;
    logPath: string;
    workspaceState: Memento;
    extension: Extension<unknown>; // Change any to unknown for better type safety

    globalState: Memento & {
        setKeysForSync(keys: readonly string[]): void;
    };
    secrets: SecretStorage;
    environmentVariableCollection: GlobalEnvironmentVariableCollection;
    extensionMode: number;
    asAbsolutePath(relativePath: string): string;

    languageModelAccessInformation: {
        authenticated: boolean;
        feature: string;
        source?: string;
    };
}



function createTypedMockEnvCollection(): GlobalEnvironmentVariableCollection {
    const mockGet = jest.fn<GetMutator>().mockImplementation(() => ({
        type: EnvironmentVariableMutatorType.Append,
        value: 'mock-value',
        options: {
            applyAtShell: true,
            applyAtProcessCreation: true
        }
    }));

    const scopedCollection: GlobalEnvironmentVariableCollection = {
        persistent: false,
        description: 'Scoped Mock Environment Variables',
        append: jest.fn(),
        prepend: jest.fn(),
        replace: jest.fn(),
        remove: jest.fn(),
        clear: jest.fn(),
        forEach: jest.fn(),
        delete: jest.fn(),
        get: mockGet,
        getScoped: jest.fn<GetScoped>(),
        [Symbol.iterator]: function* () {
            yield* [] as [string, EnvironmentVariableMutator][];
        }
    };

    const mockGetScoped = jest.fn<GetScoped>().mockReturnValue(scopedCollection);

    return {
        persistent: false,
        description: 'Mock Environment Variables',
        getScoped: mockGetScoped,
        append: jest.fn(),
        prepend: jest.fn(),
        replace: jest.fn(),
        remove: jest.fn(),
        clear: jest.fn(),
        forEach: jest.fn(),
        delete: jest.fn(),
        get: mockGet,
        [Symbol.iterator]: function* () {
            yield* [] as [string, EnvironmentVariableMutator][];
        }
    };
}





function createMockFunction(): MockFunction {
    const fn = jest.fn() as MockFunction;
    fn.calls = [];
    fn.mockReturnValue = function(value) {
        this.returnValue = value;
        return this;
    };
    fn.mockImplementation = function(implementation) {
        this.implementation = implementation;
        return this;
    };
    return fn;
}

type ScopedEnvFunction = (scope: any) => GlobalEnvironmentVariableCollection;

const createMockGet = () => {
    return jest.fn<GetMutator>().mockImplementation(() => ({
        type: EnvironmentVariableMutatorType.Append,
        value: 'mock-value',
        options: {
            applyAtShell: true,
            applyAtProcessCreation: true
        }
    }));
};

const createScopedEnvMock = () => {
    const getMock = createMockGet();
    
    return jest.fn<GetScoped>().mockImplementation((scope) => ({
        persistent: false,
        description: 'Scoped Mock Environment Variables',
        append: jest.fn(),
        prepend: jest.fn(),
        replace: jest.fn(),
        remove: jest.fn(),
        clear: jest.fn(),
        forEach: jest.fn(),
        delete: jest.fn(),
        get: getMock,
        getScoped: jest.fn<GetScoped>(),
        [Symbol.iterator]: function* () {
            yield* [] as [string, EnvironmentVariableMutator][];
        }
    }));
};


export function createMockExtensionContext(): ExtensionContext {

    const envCollection: GlobalEnvironmentVariableCollection = {
        persistent: false,
        description: 'Mock Environment Variables',
        getScoped: createScopedEnvMock(),
        append: jest.fn(),
        prepend: jest.fn(),
        replace: jest.fn(),
        remove: jest.fn(),
        clear: jest.fn(),
        forEach: jest.fn(),
        delete: jest.fn(),
        get: createMockGet(),
        [Symbol.iterator]: function* () {
            yield* [] as [string, EnvironmentVariableMutator][];
        }
    };

    
    
    return {
        subscriptions: [],
        extensionPath: '/test/path',
        extensionUri: Uri.file('/test/path'),
        storageUri: Uri.file('/test/storage'),
        globalStorageUri: Uri.file('/test/global'),
        logUri: Uri.file('/test/log'),
        storagePath: '/test/storage',
        globalStoragePath: '/test/global',
        logPath: '/test/log',
        workspaceState: {
            get: createMockFunction(),
            update: createMockFunction(),
            keys: () => []
        },
        globalState: {
            get: createMockFunction(),
            update: createMockFunction(),
            setKeysForSync: createMockFunction(),
            keys: () => []
        },
        secrets: {
            get: createMockFunction(),
            store: createMockFunction(),
            delete: createMockFunction(),
            onDidChange: jest.fn((listener) => ({
                dispose: jest.fn()
            }))
        },
        environmentVariableCollection: createMockEnvCollection(),
        extension: {
            id: 'test.extension',
            extensionPath: '/test/path',
            isActive: true,
            packageJSON: {
                name: 'test-extension',
                version: '1.0.0'
            },
            extensionUri: Uri.file('/test/path'),
            extensionKind: ExtensionKind.UI,
            exports: {},
            activate: async () => ({})
        } as Extension<any>,

        languageModelAccessInformation: {
            authenticated: true,
            feature: 'test-feature',
            source: 'test-source'
        },
        extensionMode: 1,
        asAbsolutePath: (relativePath: string) => `/test/path/${relativePath}`
    };

 
}

function createTypedMocks() {
    const getMutator = jest.fn<GetMutator>().mockImplementation(() => ({
        type: EnvironmentVariableMutatorType.Append,
        value: 'mock-value',
        options: {
            applyAtShell: true,
            applyAtProcessCreation: true
        }
    }));

    const getScopedEnv = jest.fn<GetScoped>().mockImplementation((scope) => ({
        persistent: false,
        description: 'Scoped Mock Environment Variables',
        append: jest.fn(),
        prepend: jest.fn(),
        replace: jest.fn(),
        remove: jest.fn(),
        clear: jest.fn(),
        forEach: jest.fn(),
        delete: jest.fn(),
        get: getMutator,
        getScoped: jest.fn<GetScoped>(),
        [Symbol.iterator]: function* () {
            yield* [] as [string, EnvironmentVariableMutator][];
        }
    }));

    return { getMutator, getScopedEnv };
}


function createMockEnvCollection(): GlobalEnvironmentVariableCollection {
    const { getMutator, getScopedEnv } = createTypedMocks();

    return {
        persistent: false,
        description: 'Mock Environment Variables',
        getScoped: getScopedEnv,
        append: jest.fn(),
        prepend: jest.fn(),
        replace: jest.fn(),
        remove: jest.fn(),
        clear: jest.fn(),
        forEach: jest.fn(),
        delete: jest.fn(),
        get: getMutator,
        [Symbol.iterator]: function* () {
            yield* [] as [string, EnvironmentVariableMutator][];
        }
    };
}



// npm run test:suite -- tests/mockes/vscode-types.mock.test.ts