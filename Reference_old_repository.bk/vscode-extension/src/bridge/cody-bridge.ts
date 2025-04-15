import { EnhancedLogger } from '../utils/logger';
import type { CodyResponse, CodyRequest } from '../types/cody';

export class CodyBridge {
    private logger: EnhancedLogger;
    private baseUrl: string;

    constructor() {
        this.logger = EnhancedLogger.getInstance();
        this.baseUrl = 'http://localhost:8000/api/cody';
    }

    async processMessage(message: string): Promise<CodyResponse> {
        this.logger.debug(JSON.stringify({
            message: 'Processing Cody message',
            content: message
        }));

        try {
            const response = await fetch(`${this.baseUrl}/process`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message,
                    timestamp: new Date().toISOString()
                } as CodyRequest)
            });

            if (!response.ok) {
                throw new Error(`Cody API error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            this.logger.error(JSON.stringify({
                message: 'Cody processing failed',
                error
            }));
            throw error;
        }
    }

    async analyzeContract(contractPath: string): Promise<CodyResponse> {
        return this.processMessage(`Analyze contract: ${contractPath}`);
    }

    async generateContract(spec: string): Promise<CodyResponse> {
        return this.processMessage(`Generate contract: ${spec}`);
    }
}

