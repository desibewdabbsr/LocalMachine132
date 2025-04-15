import { BaseCommand } from '../base-command';
import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import * as path from 'path';

interface ProjectConfig {
    name: string;
    version: string;
    networks: {
        [key: string]: string;
    };
    compiler: {
        version: string;
        optimizer: {
            enabled: boolean;
            runs: number;
        };
    };
}

export class ConfigCommand extends BaseCommand {
    async execute(): Promise<void> {
        return this.showProgress('Updating Project Configuration', async () => {
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders) {
                throw new Error('No workspace folder found');
            }

            const configPath = path.join(workspaceFolders[0].uri.fsPath, 'config.json');
            const config = await this.loadConfig(configPath);
            
            const action = await vscode.window.showQuickPick([
                { label: 'View Configuration' },
                { label: 'Update Networks' },
                { label: 'Update Compiler Settings' }
            ]);

            if (!action) return;

            switch (action.label) {
                case 'View Configuration':
                    await this.viewConfig(config);
                    break;
                case 'Update Networks':
                    await this.updateNetworks(config, configPath);
                    break;
                case 'Update Compiler Settings':
                    await this.updateCompilerSettings(config, configPath);
                    break;
            }
        });
    }

    private async loadConfig(configPath: string): Promise<ProjectConfig> {
        try {
            return await fs.readJSON(configPath);
        } catch (error) {
            throw new Error('Failed to load configuration file');
        }
    }

    private async viewConfig(config: ProjectConfig): Promise<void> {
        const configDocument = await vscode.workspace.openTextDocument({
            content: JSON.stringify(config, null, 2),
            language: 'json'
        });
        await vscode.window.showTextDocument(configDocument);
    }

    private async updateNetworks(config: ProjectConfig, configPath: string): Promise<void> {
        const networkName = await vscode.window.showInputBox({
            prompt: 'Enter network name (e.g., mainnet, testnet, local)'
        });

        if (!networkName) return;

        const networkUrl = await vscode.window.showInputBox({
            prompt: 'Enter network URL'
        });

        if (!networkUrl) return;

        config.networks[networkName] = networkUrl;
        await fs.writeJSON(configPath, config, { spaces: 2 });
        vscode.window.showInformationMessage(`Network ${networkName} updated successfully`);
    }

    private async updateCompilerSettings(config: ProjectConfig, configPath: string): Promise<void> {
        const version = await vscode.window.showInputBox({
            prompt: 'Enter compiler version (e.g., 0.8.0)',
            value: config.compiler?.version || '0.8.0'
        });

        if (!version) return;

        const optimizerEnabled = await vscode.window.showQuickPick(
            [{ label: 'Yes' }, { label: 'No' }],
            { placeHolder: 'Enable optimizer?' }
        );

        if (!optimizerEnabled) return;

        config.compiler = {
            version,
            optimizer: {
                enabled: optimizerEnabled.label === 'Yes',
                runs: 200
            }
        };

        await fs.writeJSON(configPath, config, { spaces: 2 });
        vscode.window.showInformationMessage('Compiler settings updated successfully');
    }
}


// npm run test:suite -- tests/suite/commands/projects/config-command.test.ts