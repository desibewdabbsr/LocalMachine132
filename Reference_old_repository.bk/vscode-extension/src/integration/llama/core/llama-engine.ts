import { EnhancedLogger } from '../../../utils/logger';
import { ModelLoader } from './model-loader';
import { PromptHandler } from '../handlers/prompt-handler';
import { ResponseProcessor } from '../handlers/response-processor';
import { HardwareManager } from '../../../config/hardware-config';
import type { LlamaConfig, ModelResponse, GenerationOptions } from '../types';

export class LlamaEngine {
    private logger: EnhancedLogger;
    private config: LlamaConfig;
    private modelLoader: ModelLoader;
    private promptHandler: PromptHandler;
    private responseProcessor: ResponseProcessor;
    private hardwareManager: HardwareManager;

    constructor(config: LlamaConfig) {
        this.logger = EnhancedLogger.getInstance();
        this.hardwareManager = new HardwareManager();
        this.config = this.optimizeConfig(config);
        this.modelLoader = new ModelLoader(this.logger);
        this.promptHandler = new PromptHandler();
        this.responseProcessor = new ResponseProcessor();
    }
    public getConfig(): LlamaConfig {
        return { ...this.config };
    }

    private optimizeConfig(config: LlamaConfig): LlamaConfig {
        const hardwareConfig = this.hardwareManager.getConfig();
        return {
            ...config,
            cpuThreads: hardwareConfig.threads,
            batchSize: hardwareConfig.batchSize,
            contextSize: Math.min(config.contextSize, 2048)
        };
    }

    async initialize(): Promise<void> {
        this.logger.debug(JSON.stringify({
            message: 'Initializing Llama Engine',
            config: this.config
        }));

        try {
            await this.modelLoader.loadModel(this.config.modelName);
            this.logger.info(JSON.stringify({
                message: 'Engine initialized successfully'
            }));
        } catch (error) {
            this.logger.error(JSON.stringify({
                message: 'Engine initialization failed',
                error
            }));
            throw error;
        }
    }

    async generate(input: string): Promise<string> {
        this.logger.debug(JSON.stringify({
            message: 'Starting generation',
            inputLength: input.length
        }));
        
        try {
            const processedPrompt = await this.promptHandler.process(input);
            const response = await this.modelLoader.generate(processedPrompt, {
                temperature: this.config.temperature,
                maxLength: this.config.maxTokens
            });
            const processedResponse = await this.responseProcessor.process(response.text);

            this.logger.debug(JSON.stringify({
                message: 'Generation completed',
                responseLength: processedResponse.length
            }));

            return processedResponse;
        } catch (error) {
            this.logger.error(JSON.stringify({
                message: 'Generation failed',
                error
            }));
            throw error;
        }
    }
}


// npm run test -- tests/suite/llama/llama-engine.test.ts 