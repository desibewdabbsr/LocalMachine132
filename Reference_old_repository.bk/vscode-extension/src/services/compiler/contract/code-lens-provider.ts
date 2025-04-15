import * as vscode from 'vscode';
import { EnhancedLogger } from '../../../utils/logger';
import { ServiceManager } from '../../service-manager';

export class ContractCodeLensProvider implements vscode.CodeLensProvider {
    private readonly logger: EnhancedLogger;
    private serviceManager: ServiceManager | undefined;

    constructor(private readonly context: vscode.ExtensionContext) {
        this.logger = EnhancedLogger.getInstance();
        this.initializeServiceManager();
    }

    private async initializeServiceManager(): Promise<void> {
        this.serviceManager = await ServiceManager.initialize(this.context, this.logger);
    }

    async provideCodeLenses(
        document: vscode.TextDocument,
        token: vscode.CancellationToken
    ): Promise<vscode.CodeLens[]> {
        return await this.logger.logOperation('codeLens', 'provide', async () => {
            const codeLenses: vscode.CodeLens[] = [];
            
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: 'Analyzing Smart Contract',
                cancellable: true
            }, async (progress) => {
                try {
                    progress.report({ increment: 0, message: 'Starting analysis...' });
                    
                    const functionMatches = await this.analyzeFunctions(document.getText());
                    progress.report({ increment: 50, message: 'Processing functions...' });

                    functionMatches.forEach(match => {
                        codeLenses.push(this.createFunctionCodeLens(document, match));
                    });

                    progress.report({ increment: 100, message: 'Analysis complete' });
                    this.logger.info(`Generated ${codeLenses.length} code lenses`);
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                    this.logger.error(`Code lens generation failed: ${errorMessage}`);
                    throw error;
                }
            });

            return codeLenses;
        });
    }

    private async analyzeFunctions(content: string): Promise<RegExpMatchArray[]> {
        const functionRegex = /function\s+(\w+)\s*\((.*?)\)/g;
        return Array.from(content.matchAll(functionRegex));
    }

    private createFunctionCodeLens(document: vscode.TextDocument, match: RegExpMatchArray): vscode.CodeLens {
        const position = document.positionAt(match.index!);
        const range = document.getWordRangeAtPosition(position)!;
        
        return new vscode.CodeLens(range, {
            title: '▶ Test Function',
            command: 'pop.testFunction',
            arguments: [match[1]]
        });
    }
}

// npm run test -- tests/suite/services/compiler/contract/code-lens-provider.test.ts