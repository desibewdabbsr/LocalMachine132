import * as vscode from 'vscode';
import { EnhancedLogger } from '../utils/logger';

export class WebviewManager {
    private panels: Map<string, vscode.WebviewPanel> = new Map();
    private logger: EnhancedLogger;

    constructor(private readonly context: vscode.ExtensionContext) {
        this.logger = EnhancedLogger.getInstance();
    }

    public createWebviewPanel(viewType: string, title: string): vscode.WebviewPanel {
        const panel = vscode.window.createWebviewPanel(
            viewType,
            title,
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );

        this.panels.set(viewType, panel);
        this.setupMessageHandler(panel);
        
        panel.onDidDispose(() => {
            this.panels.delete(viewType);
        });

        return panel;
    }

    public async postMessage(panel: vscode.WebviewPanel, message: any): Promise<void> {
        try {
            await panel.webview.postMessage(message);
        } catch (error) {
            this.logger.error(`Failed to post message to webview: ${error}`);
            throw error;
        }
    }

    private setupMessageHandler(panel: vscode.WebviewPanel): void {
        panel.webview.onDidReceiveMessage(
            async (message) => {
                try {
                    await this.handleWebviewMessage(message);
                } catch (error) {
                    this.logger.error(`Error handling webview message: ${error}`);
                }
            },
            undefined,
            this.context.subscriptions
        );
    }

    private async handleWebviewMessage(message: any): Promise<void> {
        this.logger.info(`Received webview message: ${JSON.stringify(message)}`);
        // Implement message handling logic
    }

    public dispose(): void {
        for (const panel of this.panels.values()) {
            panel.dispose();
        }
        this.panels.clear();
    }
}


// npm run test:suite -- tests/suite/webview-manager-panel.test.ts