// src/commands/generate-contract.ts
import { LlamaEngine } from '../integration/llama/core/llama-engine';
import * as vscode from 'vscode';

export async function generateContract() {
    const config = {
        modelName: 'deepseek-coder:1.3b',
        temperature: 0.7,
        maxTokens: 2048,
        contextSize: 4096,
        cpuThreads: 4,
        batchSize: 32
    };

    const llama = new LlamaEngine(config);
    
    const contractType = await vscode.window.showInputBox({
        prompt: 'Enter contract type (e.g., NFT, ERC20)',
    });

    const features = await vscode.window.showInputBox({
        prompt: 'Enter features (comma-separated)',
    });

    if (contractType && features) {
        const prompt = `Generate a ${contractType} smart contract with these features: ${features}`;
        const response = await llama.generate(prompt);
        
        const document = await vscode.workspace.openTextDocument({
            content: response,
            language: 'solidity'
        });
        
        await vscode.window.showTextDocument(document);
    }
}