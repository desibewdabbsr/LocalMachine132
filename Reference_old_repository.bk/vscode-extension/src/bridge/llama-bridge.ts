// vscode-extension/src/bridge/llama-bridge.ts
// vscode-extension/src/bridge/llama-bridge.ts
import { LlamaEngine } from './../integration/llama/core/llama-engine';
import { PromptHandler } from './../integration/llama/handlers/prompt-handler';
import { ResponseProcessor } from './../integration/llama/handlers/response-processor';
import { LlamaConfig } from '../types/llama';

const config: LlamaConfig = {
    modelName: 'deepseek-coder-1.3b',
    temperature: 0.7,
    maxTokens: 2048,
    contextSize: 4096,
    cpuThreads: 4,
    batchSize: 32
};

const engine = new LlamaEngine(config);
const handler = new PromptHandler();
const processor = new ResponseProcessor();

async function main() {
    const args = process.argv.slice(2);
    const command = args[0];
    const input = args[1];

    const response = await engine.generate(input);
    console.log(JSON.stringify({ response }));
}

main().catch(console.error);