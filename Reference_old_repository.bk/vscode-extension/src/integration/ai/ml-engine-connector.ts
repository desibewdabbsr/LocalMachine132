import { EnhancedLogger } from '../../utils/logger';

export interface CodyConfig {
    authToken: string;
    apiEndpoint: string;
    modelVersion: string;
    maxTokens: number;
    temperature: number;
    retryAttempts: number;
    timeout: number;
}

export interface CodyRequest {
    query: string;
    context?: string;
    maxTokens?: number;
    temperature?: number;
}

export interface CodyResponse {
    text: string;
    tokens: number;
    modelVersion: string;
    metadata: {
        confidence: number;
        processingTime: number;
    };
}

export class CodyEngineConnector {
    private logger: EnhancedLogger;
    private headers: Record<string, string>;
    private config: CodyConfig;

    constructor(config: CodyConfig) {
        this.logger = EnhancedLogger.getInstance();
        this.config = config;
        this.headers = {
            'Authorization': `token ${config.authToken}`,
            'Content-Type': 'application/json'
        };
    }

    async process(request: CodyRequest): Promise<CodyResponse> {
        return this.logger.logOperation('cody-api', 'process', async () => {
            const graphqlQuery = {
                query: `
                    mutation Completion($request: CompletionRequest!) {
                        completion(request: $request) {
                            text
                            tokens
                            metadata {
                                confidence
                                processingTime
                            }
                        }
                    }
                `,
                variables: {
                    request: {
                        prompt: request.query,
                        context: request.context,
                        maxTokens: request.maxTokens || this.config.maxTokens,
                        temperature: request.temperature || this.config.temperature
                    }
                }
            };

            try {
                const response = await fetch(this.config.apiEndpoint, {
                    method: 'POST',
                    headers: this.headers,
                    body: JSON.stringify(graphqlQuery)
                });

                if (!response.ok) {
                    throw new Error(`Request failed with status ${response.status}`);
                }

                const data = await response.json();
                return this.transformResponse(data);
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown error';
                throw new Error(`Cody API request failed: ${message}`);
            }
        });
    }

    private transformResponse(data: any): CodyResponse {
        const completion = data.data?.completion;
        return {
            text: completion?.text || '',
            tokens: completion?.tokens || 0,
            modelVersion: this.config.modelVersion,
            metadata: {
                confidence: completion?.metadata?.confidence || 1.0,
                processingTime: completion?.metadata?.processingTime || 0
            }
        };
    }

    async validateConnection(): Promise<boolean> {
        return this.logger.logOperation('cody-api', 'validate', async () => {
            try {
                const response = await fetch(this.config.apiEndpoint, {
                    method: 'POST',
                    headers: this.headers,
                    body: JSON.stringify({
                        query: 'query { currentUser { username } }'
                    })
                });
                return response.ok;
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown error';
                this.logger.error(`Connection validation failed: ${message}`);
                return false;
            }
        });
    }
}


// npm run test:suite -- tests/suite/integration/ai/ml-engine-connector.test.ts