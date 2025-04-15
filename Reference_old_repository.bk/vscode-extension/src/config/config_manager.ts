import { vscode } from '../../tests/mockes/vscode.mock';
import { ExtensionConfig, LogLevel } from '../../tests/types';

export class ConfigManager {
    private static instance: ConfigManager;
    private config: ExtensionConfig | undefined;
    private readonly configSection = 'popDevAssistant';

    private constructor() {}

    public static getInstance(): ConfigManager {
        if (!ConfigManager.instance) {
            ConfigManager.instance = new ConfigManager();
        }
        return ConfigManager.instance;
    }

    async getLoggerConfig(): Promise<ExtensionConfig> {
        const config = vscode.workspace.getConfiguration(this.configSection);
        
        return {
            mode: config.get('mode') as 'development' | 'production' || 'development',
            metricsEnabled: config.get('metricsEnabled') || true,
            mockEnabled: config.get('mockEnabled') || false,
            mockResponsePath: config.get('mockResponsePath') || 'tests/fixtures/responses',
            logLevel: config.get('logLevel') as LogLevel || 'INFO',
            retentionDays: config.get('retentionDays') || 30,
            security: {
                analysisEnabled: config.get('security.analysisEnabled') || true,
                vulnerabilityScanLevel: config.get('security.vulnerabilityScanLevel') || 'deep',
                autoFix: config.get('security.autoFix') || false
            },
            cody: {
                endpoint: config.get('cody.endpoint') || 'http://localhost:3000',
                timeout: config.get('cody.timeout') || 30000,
                retryAttempts: config.get('cody.retryAttempts') || 3
            },
            toolchain: {
                rust: {
                    channel: config.get('toolchain.rust.channel') || 'stable',
                    components: config.get('toolchain.rust.components') || ['rustfmt', 'clippy']
                },
                solidity: {
                    version: config.get('toolchain.solidity.version') || '0.8.19',
                    optimizer: config.get('toolchain.solidity.optimizer') || true
                }
            }
        };
    }

    async loadConfig(): Promise<ExtensionConfig> {
        this.config = await this.getLoggerConfig();
        return this.config;
    }

    getConfig(): ExtensionConfig {
        if (!this.config) {
            throw new Error('Configuration not loaded');
        }
        return this.config;
    }

    async updateConfig<T>(section: string, value: T): Promise<void> {
        const config = vscode.workspace.getConfiguration(this.configSection);
        await config.update(section, value, true);
        await this.loadConfig();
    }
}



// npm run test:suite -- tests/suite/config_manager.test.ts

// run separate tests
// npm run test:suite -- tests/suite/config_manager.test.ts --testPathIgnorePatterns=index.test.ts
