// tests/suite/activation/__mocks__/vscode-config.mock.ts
import * as vscode from 'vscode';

const mockConfiguration = {
    get: jest.fn().mockImplementation((key: string) => ({
        mode: 'development',
        logLevel: 'INFO',
        metricsEnabled: true
    })[key]),
    update: jest.fn().mockResolvedValue(undefined)
};

export const mockVSCodeConfig: Partial<typeof vscode> = {
    workspace: {
        getConfiguration: jest.fn().mockReturnValue(mockConfiguration),
        getWorkspaceFolder: jest.fn(),
        asRelativePath: jest.fn(),
        updateWorkspaceFolders: jest.fn(),
        createFileSystemWatcher: jest.fn(),
        findFiles: jest.fn(),
        save: jest.fn(),
        saveAs: jest.fn(),
        openTextDocument: jest.fn(),
        onDidOpenTextDocument: jest.fn(),
        onDidCloseTextDocument: jest.fn(),
        onDidChangeNotebookDocument: jest.fn(),
        onWillSaveNotebookDocument: jest.fn(),
        onDidChangeConfiguration: jest.fn(),
        name: 'test-workspace',
        workspaceFile: undefined,
        onDidChangeWorkspaceFolders: jest.fn(),
        onDidChangeTextDocument: jest.fn(),
        onDidCreateFiles: jest.fn(),
        onDidDeleteFiles: jest.fn(),
        onDidRenameFiles: jest.fn(),
        onWillCreateFiles: jest.fn(),
        onWillDeleteFiles: jest.fn(),
        onWillRenameFiles: jest.fn(),
        onWillSaveTextDocument: jest.fn(),
        onDidSaveTextDocument: jest.fn(),
        saveAll: jest.fn(),
        applyEdit: jest.fn(),
        textDocuments: [],
        rootPath: '/test/path',
        workspaceFolders: undefined,
        fs: {
            createDirectory: jest.fn(),
            delete: jest.fn(),
            readDirectory: jest.fn(),
            readFile: jest.fn(),
            rename: jest.fn(),
            stat: jest.fn(),
            writeFile: jest.fn(),
            copy: jest.fn(),
            isWritableFileSystem: jest.fn().mockImplementation((scheme: string) => true)
        },
        registerTextDocumentContentProvider: jest.fn(),
        openNotebookDocument: jest.fn(),
        registerNotebookSerializer: jest.fn(),
        registerTaskProvider: jest.fn(),
        notebookDocuments: [],
        onDidOpenNotebookDocument: jest.fn(),
        onDidCloseNotebookDocument: jest.fn(),
        onDidSaveNotebookDocument: jest.fn(),
        registerFileSystemProvider: jest.fn(),
        registerTimelineProvider: jest.fn(),
        isTrusted: true,
        trusted: true,
        onDidGrantWorkspaceTrust: jest.fn()
    } as unknown as typeof vscode.workspace,
    ConfigurationTarget: vscode.ConfigurationTarget,
    version: '1.60.0',
    Position: vscode.Position,
    Range: vscode.Range,
    Selection: vscode.Selection
};

export default mockVSCodeConfig as typeof vscode;