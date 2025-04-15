// tests/suite/activation/types/activation-types.ts
import * as vscode from 'vscode';

export type ProgressTask = (
    progress: vscode.Progress<{ message?: string; increment?: number }>,
    token: vscode.CancellationToken
) => Thenable<any>;

export interface ActivationTestContext extends Omit<vscode.ExtensionContext, 'extensionRuntime' | 'environmentVariableCollection'> {
    extensionPath: string;
    extensionUri: vscode.Uri;
    subscriptions: vscode.Disposable[];
    workspaceState: vscode.Memento;
    globalState: vscode.Memento & { setKeysForSync(keys: readonly string[]): void };
    secrets: vscode.SecretStorage;
    extensionMode: vscode.ExtensionMode;
    environmentVariableCollection: vscode.GlobalEnvironmentVariableCollection;
    asAbsolutePath: (relativePath: string) => string;
    storageUri: vscode.Uri | undefined;
    globalStorageUri: vscode.Uri;
    logUri: vscode.Uri;
    extensionRuntime: number;
}