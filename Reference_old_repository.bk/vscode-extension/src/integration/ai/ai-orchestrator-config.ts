import type { ExtensionConfig } from '../../../tests/types';
import { EnhancedLogger } from '../../utils/logger';


export interface AIConfig {
    endpoint: string;
    timeout: number;
    retryAttempts: number;
    modelVersion: string;
    maxTokens: number;
    temperature: number;
}

export class AIOrchestratorConfig {
    private logger: EnhancedLogger;
    private config: AIConfig;

    constructor(extensionConfig: ExtensionConfig) {
        this.logger = EnhancedLogger.getInstance();
        this.config = this.initializeConfig(extensionConfig);
    }

    private initializeConfig(extensionConfig: ExtensionConfig): AIConfig {
        return {
            endpoint: extensionConfig.cody.endpoint,
            timeout: extensionConfig.cody.timeout,
            retryAttempts: extensionConfig.cody.retryAttempts,
            modelVersion: 'gpt-4',
            maxTokens: 2048,
            temperature: 0.7
        };
    }

    public getConfig(): AIConfig {
        return { ...this.config };
    }

    public async updateConfig(updates: Partial<AIConfig>): Promise<void> {
        return this.logger.logOperation('ai-config', 'update', async () => {
            this.config = {
                ...this.config,
                ...updates
            };
            this.logger.info('AI configuration updated successfully');
        });
    }

    public validateConfig(): boolean {
        const { endpoint, timeout, retryAttempts } = this.config;
        return Boolean(
            endpoint &&
            timeout > 0 &&
            retryAttempts > 0
        );
    }
}


// npm run test:suite -- tests/suite/integration/ai/ai-orchestrator-config.test.ts