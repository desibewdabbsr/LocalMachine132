import { BaseCommand } from '../base-command';
import * as fs from 'fs-extra';
import * as path from 'path';

export class InitCommand extends BaseCommand {
    async execute(projectPath: string): Promise<void> {
        return this.showProgress('Initializing Project', async () => {
            const templatePath = path.join(this.context.extensionPath, 'templates');
            
            await fs.copy(templatePath, projectPath);
            
            const configPath = path.join(projectPath, 'config.json');
            await fs.writeJSON(configPath, {
                name: path.basename(projectPath),
                version: '1.0.0',
                networks: {
                    local: 'http://127.0.0.1:8545',
                    testnet: 'https://testnet.example.com'
                }
            }, { spaces: 2 });
        });
    }
}