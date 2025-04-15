import { EnhancedLogger } from '../../../utils/logger';

export class LlamaConnectionManager {
    private logger: EnhancedLogger;
    private static readonly BASE_URL = 'http://localhost:11434';
    private static readonly MAX_RETRIES = 3;
    private static readonly RETRY_DELAY = 1000;

    constructor() {
        this.logger = EnhancedLogger.getInstance();
    }

    async verifyConnection(): Promise<boolean> {
        for (let attempt = 1; attempt <= LlamaConnectionManager.MAX_RETRIES; attempt++) {
            try {
                const response = await fetch(`${LlamaConnectionManager.BASE_URL}/api/tags`);
                if (response.ok) {
                    this.logger.info(JSON.stringify({
                        message: 'Ollama connection verified',
                        attempt
                    }));
                    return true;
                }
            } catch (error) {
                this.logger.warn(JSON.stringify({
                    message: 'Connection attempt failed',
                    attempt,
                    error: error instanceof Error ? error.message : 'Unknown error'
                }));
                await this.delay(LlamaConnectionManager.RETRY_DELAY);
            }
        }
        return false;
    }

    async sendRequest(endpoint: string, payload: any): Promise<Response> {
        if (!await this.verifyConnection()) {
            throw new Error('Cannot establish connection to Ollama service');
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 120000);

        try {
            const response = await fetch(`${LlamaConnectionManager.BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload),
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}