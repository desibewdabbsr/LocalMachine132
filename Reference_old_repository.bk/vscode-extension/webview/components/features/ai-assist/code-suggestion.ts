import { EnhancedLogger } from '../../../../src/utils/logger';
import { AIOrchestrator, AIRequest, AIResponse } from '../../../../src/integration/ai/ai-orchestrator-bridge';
import { CodyEngineConnector, CodyRequest, CodyResponse } from '../../../../src/integration/ai/ml-engine-connector';

export class CodeSuggestionService {
    private readonly logger: EnhancedLogger;
    private isInitialized = false;

    constructor(
        private aiOrchestrator: AIOrchestrator,
        private mlEngine: CodyEngineConnector
    ) {
        this.logger = EnhancedLogger.getInstance();
    }


    async initialize(): Promise<void> {
        return this.logger.logOperation('code-suggestion', 'initialization', async () => {
            try {
                await this.aiOrchestrator.initialize();
                this.isInitialized = true;
                this.logger.info('Code suggestion service initialized successfully');
            } catch (error: unknown) {
                const errorMessage = error instanceof Error 
                    ? error.message 
                    : 'Unknown error during initialization';
                this.logger.error(`Initialization failed: ${errorMessage}`);
                throw new Error(`Failed to initialize code suggestion service: ${errorMessage}`);
            }
        });
    }

    async getSuggestions(context: string): Promise<string[]> {
        return this.logger.logOperation('code-suggestion', 'generate', async () => {
            try {
                const request: CodyRequest = {
                    query: 'Generate code suggestions',
                    context,
                    maxTokens: 100,
                    temperature: 0.7
                };
    
                const response = await this.mlEngine.process(request);
                return this.parseSuggestions(response);
            } catch (error) {
                this.logger.error(`Suggestion generation failed: ${error}`);
                throw new Error('Failed to generate suggestions');
            }
        });
    }
    

    async analyzeContext(code: string): Promise<any> {
        return this.logger.logOperation('code-suggestion', 'analyze-context', async () => {
            try {
                this.validateInitialization();
                return await this.aiOrchestrator.processRequest({
                    type: 'context-analysis',
                    code
                });
            } catch (error: unknown) {
                const errorMessage = error instanceof Error 
                    ? error.message 
                    : 'Unknown error during context analysis';
                this.logger.error(`Context analysis failed: ${errorMessage}`);
                throw new Error('Failed to analyze context');
            }
        });
    }

    async getRealTimeSuggestion(input: string): Promise<string> {
        return this.logger.logOperation('code-suggestion', 'real-time', async () => {
            try {
                this.validateInitialization();

                const request: CodyRequest = {
                    query: 'Complete code',
                    context: input,
                    maxTokens: 50,
                    temperature: 0.3
                };

                const response = await this.mlEngine.process(request);
                return response.text;
            } catch (error: unknown) {
                const errorMessage = error instanceof Error 
                    ? error.message 
                    : 'Unknown error during real-time suggestion';
                this.logger.error(`Real-time suggestion failed: ${errorMessage}`);
                throw new Error('Failed to generate real-time suggestion');
            }
        });
    }

    private validateInitialization(): void {
        if (!this.isInitialized) {
            throw new Error('Code suggestion service not initialized');
        }
    }

    private parseSuggestions(response: CodyResponse): string[] {
        try {
            return JSON.parse(response.text);
        } catch {
            this.logger.error('Failed to parse suggestions response');
            return [];
        }
    }
}

// npm run test -- tests/suite/webview/components/features/ai-assist/code-suggestion.test.ts