/**
 * @jest-environment node
 */


jest.mock('vscode', () => ({
    window: {
        withProgress: jest.fn((options, task: any) => task({ report: jest.fn() })),
        showInformationMessage: jest.fn(),
        showQuickPick: jest.fn(() => Promise.resolve('local'))
    },
    ProgressLocation: {
        Notification: 1
    },
    ExtensionMode: {
        Test: 2,
        Development: 1,
        Production: 3
    }
}));

import { describe, expect, test, beforeEach, jest } from '@jest/globals';
import { DeployCommand } from '../../../../src/commands/contract/deploy-command';
import * as vscode from 'vscode';
import { ethers } from 'ethers';

describe('DeployCommand Tests', () => {
    let deployCommand: DeployCommand;
    
    beforeEach(() => {
        const mockContext: vscode.ExtensionContext = {
            extensionPath: '',
            subscriptions: [],
            workspaceState: {} as any,
            globalState: {} as any,
            extensionUri: {} as any,
            storageUri: {} as any,
            logUri: {} as any,
            globalStorageUri: {} as any,
            secrets: {} as any,
            environmentVariableCollection: {} as any,
            asAbsolutePath: (relativePath: string) => relativePath,
            storagePath: '',
            logPath: '',
            extensionMode: vscode.ExtensionMode.Test,
            globalStoragePath: '',
            extension: {} as any,
            languageModelAccessInformation: {} as any
        };
        
        deployCommand = new DeployCommand(mockContext);
    });

    test('should deploy contract successfully', async () => {
        const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545');
        const signer = new ethers.Wallet(
            '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80', 
            provider
        );
        
        // Simple storage contract bytecode and ABI
        const contractInfo = {
            abi: [
                {
                    "inputs": [],
                    "stateMutability": "nonpayable",
                    "type": "constructor"
                }
            ],
            bytecode: '0x608060405234801561001057600080fd5b5060b28061001f6000396000f3fe6080604052348015600f57600080fd5b506004361060285760003560e01c80632e64cec114602d575b600080fd5b60336047565b604051603e91906067565b60405180910390f35b60008054905090565b6000819050919050565b6061816050565b82525050565b6000602082019050607a6000830184605a565b9291505056fea264697066735822122087888a3889b2a07c618f292186def70e2f30f88c904a4d92fb883e9c542e642b64736f6c63430008120033',
            signer
        };

        await deployCommand.execute(contractInfo);
        expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
            expect.stringContaining('Contract deployed at:')
        );
    });

    test('should handle network selection cancellation', async () => {
        jest.spyOn(vscode.window, 'showQuickPick').mockResolvedValueOnce(undefined);
        const contractInfo = {
            abi: [],
            bytecode: '0x',
            signer: {} as any
        };

        await expect(deployCommand.execute(contractInfo)).rejects.toThrow('Network selection cancelled');
    });
});










// npm run test:suite -- tests/suite/commands/contract/deploy-command.test.ts

/*
run local hardhat node before running this test

cd hardhat-project
npx hardhat node

Make sure to replace 'your-project-id' with your actual Infura project ID.
    test('should deploy contract successfully', async () => {

*/