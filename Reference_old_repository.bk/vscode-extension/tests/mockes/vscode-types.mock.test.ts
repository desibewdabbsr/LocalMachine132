import { describe, expect, test, beforeEach } from '@jest/globals';
import { Uri, createMockExtensionContext } from './vscode-types.mock';
import { EnvironmentVariableMutatorType } from './vscode-types.mock';

describe('VSCode Types Mock', () => {
    


    describe('Uri', () => {
        test('creates file URI correctly', () => {
            const uri = Uri.file('/test/path');
            expect(uri.scheme).toBe('file');
            expect(uri.path).toBe('/test/path');
            expect(uri.toString()).toBe('file:///test/path');
        });

        test('parses URIs correctly', () => {
            const uri = Uri.parse('https://example.com/path?query=test#fragment');
            expect(uri.scheme).toBe('https');
            expect(uri.authority).toBe('example.com');
            expect(uri.path).toBe('/path');
            expect(uri.query).toBe('query=test');
            expect(uri.fragment).toBe('fragment');
        });


        test('provides fsPath property', () => {
            const uri = Uri.file('/test/path');
            expect(uri.fsPath).toBe('/test/path');
        });

        test('implements with() for modifications', () => {
            const uri = Uri.file('/test/path');
            const modified = uri.with({ scheme: 'https' });
            expect(modified.scheme).toBe('https');
            expect(modified.path).toBe('/test/path');
        });

        test('implements toJSON()', () => {
            const uri = Uri.file('/test/path');
            const json = uri.toJSON();
            expect(json).toHaveProperty('scheme', 'file');
            expect(json).toHaveProperty('path', '/test/path');
            expect(json).toHaveProperty('fsPath', '/test/path');
        });
        
    });





    describe('ExtensionContext', () => {
        let context: ReturnType<typeof createMockExtensionContext>;

        beforeEach(() => {
            context = createMockExtensionContext();
        });

        test('provides all required properties', () => {
            expect(context.extensionPath).toBeDefined();
            expect(context.extensionUri).toBeDefined();
            expect(context.storageUri).toBeDefined();
            expect(context.workspaceState).toBeDefined();
            expect(context.globalState).toBeDefined();
            expect(context.secrets).toBeDefined();
            expect(context.environmentVariableCollection).toBeDefined();
        });

        test('mock functions are callable', () => {
            context.workspaceState.get('test');
            expect(context.workspaceState.get).toHaveBeenCalledWith('test');
        });

        test('handles path resolution correctly', () => {
            const absolutePath = context.asAbsolutePath('relative/path');
            expect(absolutePath).toBe('/test/path/relative/path');
        });

        test('provides storage paths and URIs', () => {
            expect(context.extensionPath).toBe('/test/path');
            expect(context.storageUri).toBeDefined();
            expect(context.globalStorageUri).toBeDefined();
            expect(context.logUri).toBeDefined();
        });

        test('provides language model information', () => {
            expect(context.languageModelAccessInformation).toBeDefined();
            expect(context.languageModelAccessInformation.authenticated).toBe(true);
            expect(context.languageModelAccessInformation.feature).toBe('test-feature');
        });


        test('provides required extension properties', () => {
            expect(context.extension).toBeDefined();
            expect(context.extension.id).toBe('test.extension');
            expect(context.extension.isActive).toBe(true);
            expect(context.extension.packageJSON).toBeDefined();
        });

        test('provides storage paths and URIs', () => {
            expect(context.extensionPath).toBe('/test/path');
            expect(context.storageUri).toBeDefined();
            expect(context.globalStorageUri).toBeDefined();
            expect(context.logUri).toBeDefined();
        });

        test('provides language model information', () => {
            expect(context.languageModelAccessInformation).toBeDefined();
            expect(context.languageModelAccessInformation.authenticated).toBe(true);
            expect(context.languageModelAccessInformation.feature).toBe('test-feature');
        });
    });




    describe('Memento', () => {
        let context: ReturnType<typeof createMockExtensionContext>;

        beforeEach(() => {
            context = createMockExtensionContext();
        });

        test('workspaceState implements Memento interface', () => {
            expect(typeof context.workspaceState.get).toBe('function');
            expect(typeof context.workspaceState.update).toBe('function');
            expect(typeof context.workspaceState.keys).toBe('function');
        });

        test('globalState implements extended Memento interface', () => {
            expect(typeof context.globalState.get).toBe('function');
            expect(typeof context.globalState.update).toBe('function');
            expect(typeof context.globalState.keys).toBe('function');
            expect(typeof context.globalState.setKeysForSync).toBe('function');
        });

        test('workspaceState implements get/update', async () => {
            await context.workspaceState.update('testKey', 'testValue');
            context.workspaceState.get('testKey');

            expect(context.workspaceState.update).toHaveBeenCalledWith('testKey', 'testValue');
            expect(context.workspaceState.get).toHaveBeenCalledWith('testKey');
        });

        test('globalState implements extended functionality', async () => {
            const keys = ['key1', 'key2'];
            context.globalState.setKeysForSync(keys);
            
            expect(context.globalState.setKeysForSync).toHaveBeenCalledWith(keys);
            expect(context.globalState.keys()).toEqual([]);
        });





    });





    describe('SecretStorage', () => {
        let context: ReturnType<typeof createMockExtensionContext>;
    
        beforeEach(() => {
            context = createMockExtensionContext();
        });
    
        test('implements all required methods', () => {
            expect(context.secrets.get).toBeDefined();
            expect(context.secrets.store).toBeDefined();
            expect(context.secrets.delete).toBeDefined();
            expect(context.secrets.onDidChange).toBeDefined();
        });
    
        test('onDidChange returns disposable', () => {
            const disposable = context.secrets.onDidChange(() => {});
            expect(disposable.dispose).toBeDefined();
        });
    });



    describe('EnvironmentVariableCollection', () => {
        let context: ReturnType<typeof createMockExtensionContext>;
    
        beforeEach(() => {
            context = createMockExtensionContext();
        });
    
        test('implements all required methods', () => {
            const env = context.environmentVariableCollection;
            expect(env.getScoped).toBeDefined();
            expect(env.append).toBeDefined();
            expect(env.prepend).toBeDefined();
            expect(env.replace).toBeDefined();
            expect(env.remove).toBeDefined();
            expect(env.clear).toBeDefined();
            expect(env.forEach).toBeDefined();
            expect(env.delete).toBeDefined();
            expect(env.get).toBeDefined();
        });
    
        test('handles variable mutations', () => {
            const env = context.environmentVariableCollection;
            env.append('PATH', '/test/bin');
            env.prepend('PATH', '/usr/local/bin');
            env.replace('HOME', '/test/home');
            
            expect(env.append).toHaveBeenCalledWith('PATH', '/test/bin');
            expect(env.prepend).toHaveBeenCalledWith('PATH', '/usr/local/bin');
            expect(env.replace).toHaveBeenCalledWith('HOME', '/test/home');
        });


        test('implements iterator protocol', () => {
            const env = context.environmentVariableCollection;
            expect(Symbol.iterator in env).toBe(true);
            expect(() => [...env]).not.toThrow();
        });

        test('has required description property', () => {
            expect(context.environmentVariableCollection.description).toBe('Mock Environment Variables');
        });
    
        test('implements all required collection methods', () => {
            const env = context.environmentVariableCollection;
            expect(env.getScoped).toBeDefined();
            expect(env.append).toBeDefined();
            expect(env.prepend).toBeDefined();
            expect(env.replace).toBeDefined();
            expect(env.remove).toBeDefined();
            expect(env.clear).toBeDefined();
            expect(env.forEach).toBeDefined();
            expect(env.delete).toBeDefined();
            expect(env.get).toBeDefined();
        });
    
    
        test('handles scoped environments', () => {
            const env = context.environmentVariableCollection;
            const scope = { workspaceFolder: '/test' };
            
            const mockScopedEnv = {
                persistent: false,
                description: 'Scoped Mock Environment Variables',
                append: jest.fn(),
                prepend: jest.fn(),
                replace: jest.fn(),
                get: jest.fn(),
                [Symbol.iterator]: function* () {
                    yield* [];
                }
            };
            
            (env.getScoped as jest.Mock).mockReturnValue(mockScopedEnv);
            
            const scopedEnv = env.getScoped(scope);
            expect(scopedEnv).toBeDefined();
            expect(scopedEnv.description).toBe('Scoped Mock Environment Variables');
        });
        
        

    });
    
    
    
});



// npm run test:suite -- tests/mockes/vscode-types.mock.test.ts
