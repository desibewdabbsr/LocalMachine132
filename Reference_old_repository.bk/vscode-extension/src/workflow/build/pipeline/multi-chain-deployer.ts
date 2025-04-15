import { EnhancedLogger } from '../../../utils/logger';
import { NetworkProvider } from '../../../services/network/network-provider';
import { ContractBuilder } from './contract-builder';
import * as vscode from 'vscode';
import { ethers } from 'ethers';

interface ChainConfig {
    chainId: number;
    rpcUrl: string;
    name: string;
    verifyContract: boolean;
}

interface DeploymentResult {
    chainId: number;
    address: string;
    txHash: string;
    timestamp: number;
    verificationUrl?: string;
    deploymentDuration: number;
}


export class MultiChainDeployer {
    private logger: EnhancedLogger;
    private isInitialized = false;

    constructor(
        private readonly networkService: NetworkProvider,  // Updated type
        private readonly contractBuilder: ContractBuilder,
        private readonly chains: ChainConfig[]
    ) {
        this.logger = EnhancedLogger.getInstance();
    }

    async initialize(): Promise<void> {
        return this.logger.logOperation('multi-chain-deployer', 'initialize', async () => {
            try {
                await this.validateChainConfigs();
                this.isInitialized = true;
                this.logger.info('Multi-chain deployer initialized successfully');
            } catch (error) {
                this.logger.error(`Multi-chain deployer initialization failed: ${error}`);
                throw new Error('Invalid chain configuration');  // Updated error message
            }
        });
    }
    

    async deployToChains(
        contractPath: string, 
        constructorArgs: any[] = []
    ): Promise<DeploymentResult[]> {
        if (!this.isInitialized) {
            throw new Error('Multi-chain deployer not initialized');
        }

        return this.logger.logOperation('multi-chain-deployer', 'deploy', async () => {
            const results: DeploymentResult[] = [];
            const buildResult = await this.contractBuilder.buildContract(contractPath);

            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: 'Deploying Contract to Multiple Chains',
                cancellable: false
            }, async (progress) => {
                const increment = 100 / this.chains.length;

                for (const chain of this.chains) {
                    try {
                        progress.report({ 
                            message: `Deploying to ${chain.name}...`,
                            increment 
                        });

                        const startTime = Date.now();
                        await this.networkService.connect(chain.rpcUrl);

                        const signer = new ethers.Wallet(
                            // Hardhat's first account private key
                            '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
                            await this.networkService.getNetworkProvider(chain.rpcUrl)
                        );

                        const contract = await this.networkService.deploy(
                            buildResult.abi,
                            buildResult.bytecode,
                            signer,
                            ...constructorArgs
                        );

                        const result: DeploymentResult = {
                            chainId: chain.chainId,
                            address: contract.address,
                            txHash: contract.deployTransaction.hash,
                            timestamp: Date.now(),
                            deploymentDuration: Date.now() - startTime
                        };

                        if (chain.verifyContract) {
                            const verification = await this.networkService.verify(
                                contract.address,
                                constructorArgs
                            );
                            result.verificationUrl = verification.url;
                        }

                        results.push(result);
                        this.logger.info(
                            `Contract deployed successfully to ${chain.name} at ${contract.address}`
                        );
                    } catch (error) {
                        this.logger.error(
                            `Deployment failed on chain ${chain.name}: ${error}`
                        );
                        throw new Error(`Deployment failed on ${chain.name}: ${error}`);
                    }
                }
            });

            return results;
        });
    }

    private async validateChainConfigs(): Promise<void> {
        this.logger.debug('Validating chain configurations');
        for (const chain of this.chains) {
            if (!chain.rpcUrl || !chain.chainId) {
                throw new Error(`Invalid chain configuration for ${chain.name}`);
            }
        }
    }
}