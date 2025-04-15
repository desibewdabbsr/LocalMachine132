import { ModelLoader } from '../core/model-loader';
import { EnhancedLogger } from '../../../utils/logger';
import { LlamaConnectionManager } from '../core/connection-manager';
import type { ModelResponse } from '../types';

const logger = EnhancedLogger.getInstance();
const connectionManager = new LlamaConnectionManager();

const modelConfig = {
    modelName: 'deepseek-coder:1.3b',
    contextSize: 16384,
    embeddingSize: 2048,
    quantization: 'Q4_0',
    temperature: 0.7,
    maxTokens: 2048
};

async function interactWithLlama() {
    console.log('Starting Llama interaction test with Deepseek Coder...');
    
    const modelLoader = new ModelLoader(logger);
    
    try {
        // First verify Ollama connection
        const isConnected = await connectionManager.verifyConnection();
        if (!isConnected) {
            throw new Error('Ollama service is not available');
        }

        console.log('Loading Deepseek Coder model...');
        await modelLoader.loadModel(modelConfig.modelName);
        
        const prompt = `Write a simple ERC20 token contract with:
- Fixed supply
- Basic transfer functionality
- Events for transfers`;
        
        console.log('\nGenerating response for:', prompt);
        
        // Use connection manager for the request
        const response = await connectionManager.sendRequest('/api/generate', {
            model: modelConfig.modelName,
            prompt,
            stream: false,
            options: {
                temperature: modelConfig.temperature,
                num_predict: modelConfig.maxTokens
            }
        });

        const result = await response.json();
        
        console.log('\nGenerated Response:');
        console.log('-------------------');
        console.log(result.response);
        console.log('-------------------');
        
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        console.error('Error during Llama interaction:', errorMessage);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\nGracefully shutting down...');
    process.exit(0);
});

// Execute with proper error handling
interactWithLlama().then(() => {
    console.log('\nTest completed successfully');
    process.exit(0);
});


//check ollama connection
// npx ts-node src/integration/llama/tests/llama-interaction.test.ts