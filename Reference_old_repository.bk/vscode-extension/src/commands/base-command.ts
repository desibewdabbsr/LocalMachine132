import * as vscode from 'vscode';

export abstract class BaseCommand {
    constructor(protected context: vscode.ExtensionContext) {}
    
    abstract execute(...args: any[]): Promise<void>;
    
    protected async showProgress<T>(title: string, task: () => Promise<T>): Promise<T> {
        return await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title,
            cancellable: true
        }, async (progress) => {
            return await task();
        });
    }
}



// npm run test:suite -- tests/suite/commands/base-command.test.ts