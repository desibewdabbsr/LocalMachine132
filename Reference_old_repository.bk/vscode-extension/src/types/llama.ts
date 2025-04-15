// vscode-extension/src/types/llama.ts
export interface LlamaConfig {
    modelName: string;
    temperature: number;
    maxTokens: number;
    contextSize: number;
    cpuThreads: number;
    batchSize: number;
}