// tests/suite/activation/__mocks__/config-update.mock.ts
import * as vscode from 'vscode';

const updateMock = jest.fn().mockResolvedValue(undefined);

export const mockConfigUpdate = {
    workspace: {
        getConfiguration: jest.fn().mockReturnValue({
            get: jest.fn().mockImplementation((key: string) => ({
                mode: 'development',
                logLevel: 'INFO',
                metricsEnabled: true
            })[key]),
            update: updateMock
        }),
        // Required workspace methods
        getWorkspaceFolder: jest.fn(),
        asRelativePath: jest.fn(),
        updateWorkspaceFolders: jest.fn(),
        createFileSystemWatcher: jest.fn(),
        findFiles: jest.fn(),
        save: jest.fn(),
        saveAs: jest.fn(),
        openTextDocument: jest.fn(),
        registerTextDocumentContentProvider: jest.fn(),
        openNotebookDocument: jest.fn(),
        registerNotebookSerializer: jest.fn(),
        registerTaskProvider: jest.fn(),
        registerFileSystemProvider: jest.fn(),
        registerTimelineProvider: jest.fn(),
        
        // Properties
        textDocuments: [],
        notebookDocuments: [],
        workspaceFolders: undefined,
        name: 'test-workspace',
        workspaceFile: undefined,
        isTrusted: true,
        
        // Event handlers
        onDidChangeWorkspaceFolders: jest.fn(),
        onDidChangeTextDocument: jest.fn(),
        onDidSaveTextDocument: jest.fn(),
        onDidOpenNotebookDocument: jest.fn(),
        onDidCloseNotebookDocument: jest.fn(),
        onDidSaveNotebookDocument: jest.fn(),
        onDidChangeNotebookDocument: jest.fn(),
        onWillSaveNotebookDocument: jest.fn(),
        onDidGrantWorkspaceTrust: jest.fn(),
        
        // File system
        fs: {
            createDirectory: jest.fn(),
            delete: jest.fn(),
            readDirectory: jest.fn(),
            readFile: jest.fn(),
            rename: jest.fn(),
            stat: jest.fn(),
            writeFile: jest.fn(),
            copy: jest.fn(),
            isWritableFileSystem: jest.fn().mockImplementation(() => true)
        }
    } as unknown as typeof vscode.workspace,
    ConfigurationTarget: vscode.ConfigurationTarget
} as unknown as typeof vscode;

export { updateMock };