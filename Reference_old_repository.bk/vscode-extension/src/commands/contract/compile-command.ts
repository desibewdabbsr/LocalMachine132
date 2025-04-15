import { BaseCommand } from '../base-command';
import { CompilerService } from '../../services/compiler/compiler-service';
import * as vscode from 'vscode';

export class CompileCommand extends BaseCommand {
    private compiler: CompilerService;

    constructor(context: vscode.ExtensionContext) {
        super(context);
        this.compiler = new CompilerService();
    }

    async execute(contractPath?: string): Promise<void> {
        return this.showProgress('Compiling Smart Contract', async () => {
            if (!contractPath) {
                const files = await vscode.workspace.findFiles('**/*.sol');
                if (files.length === 0) {
                    throw new Error('No Solidity files found');
                }
                contractPath = files[0].fsPath;
            }
            
            const result = await this.compiler.compile(contractPath);
            vscode.window.showInformationMessage(`Compilation successful: ${result.contractName}`);
        });
    }
}