import { EnhancedLogger } from '../../../utils/logger';
import { NetworkProvider } from '../../../services/network/network-provider';
import { ContractBuilder } from '../pipeline/contract-builder';
import * as vscode from 'vscode';
import { ethers } from 'ethers';

interface TestConfig {
    testPath: string;
    networkUrl: string;
    gasLimit?: number;
    timeout?: number;
}

interface TestResult {
    passed: boolean;
    gasUsed: number;
    executionTime: number;
    errors?: string[];
    coverage?: {
        lines: number;
        branches: number;
        functions: number;
    };
}

export class ContractTester {
    private logger: EnhancedLogger;
    private isInitialized = false;

    constructor(
        private readonly networkProvider: NetworkProvider,
        private readonly contractBuilder: ContractBuilder,
        private readonly config: TestConfig
    ) {
        this.logger = EnhancedLogger.getInstance();
    }

    async initialize(): Promise<void> {
        return this.logger.logOperation('contract-tester', 'initialize', async () => {
            try {
                await this.validateConfig();
                await this.networkProvider.connect(this.config.networkUrl);
                this.isInitialized = true;
                this.logger.info('Contract tester initialized successfully');
            } catch (error) {
                this.logger.error(`Contract tester initialization failed: ${error}`);
                throw new Error('Failed to initialize contract tester');
            }
        });
    }

    async runTests(): Promise<TestResult[]> {
        if (!this.isInitialized) {
            throw new Error('Contract tester not initialized');
        }

        return this.logger.logOperation('contract-tester', 'run-tests', async () => {
            const results: TestResult[] = [];

            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: 'Running Contract Tests',
                cancellable: false
            }, async (progress) => {
                try {
                    const buildResult = await this.contractBuilder.buildContract(this.config.testPath);
                    progress.report({ message: 'Contract compiled', increment: 20 });

                    const provider = await this.networkProvider.getNetworkProvider(this.config.networkUrl);
                    const signer = new ethers.Wallet(
                        process.env.TEST_PRIVATE_KEY || ethers.Wallet.createRandom().privateKey,
                        provider
                    );

                    const contract = await this.deployTestContract(buildResult, signer);
                    progress.report({ message: 'Test contract deployed', increment: 40 });

                    const testResults = await this.executeTests(contract);
                    progress.report({ message: 'Tests executed', increment: 30 });

                    const coverage = await this.analyzeCoverage(contract);
                    progress.report({ message: 'Coverage analyzed', increment: 10 });

                    results.push({
                        ...testResults,
                        coverage
                    });

                } catch (error) {
                    this.logger.error(`Test execution failed: ${error}`);
                    throw new Error(`Test execution failed: ${error}`);
                }
            });

            return results;
        });
    }

    private async validateConfig(): Promise<void> {
        if (!this.config.testPath || !this.config.networkUrl) {
            throw new Error('Invalid test configuration');
        }
    }

    private async deployTestContract(buildResult: any, signer: ethers.Signer): Promise<ethers.Contract> {
        return this.logger.logOperation('contract-tester', 'deploy-test', async () => {
            try {
                return await this.networkProvider.deploy(
                    buildResult.abi,
                    buildResult.bytecode,
                    signer,
                    []
                );
            } catch (error) {
                throw new Error(`Failed to deploy test contract: ${error}`);
            }
        });
    }


    private async executeTests(contract: ethers.Contract): Promise<TestResult> {
        const startTime = Date.now();
        const errors: string[] = [];
        let gasUsed = 0;
    
        try {
            const testFunctions = Object.keys(contract.interface.functions)
                .filter(fn => fn.startsWith('test'));
    
            for (const testFunction of testFunctions) {
                try {
                    const tx = await contract.functions[testFunction]();
                    const receipt = await tx.wait();
                    gasUsed += receipt.gasUsed.toNumber();
                } catch (error) {
                    errors.push(`${testFunction}: ${error}`);
                }
            }
    
            return {
                passed: errors.length === 0,
                gasUsed,
                executionTime: Date.now() - startTime,
                errors: errors.length > 0 ? errors : undefined
            };
        } catch (error) {
            throw new Error(`Test execution error: ${error}`);
        }
    }
    
    

    private async analyzeCoverage(contract: ethers.Contract): Promise<TestResult['coverage']> {
        // Implementation for coverage analysis
        return {
            lines: 0,
            branches: 0,
            functions: 0
        };
    }
}


// npm run test -- tests/suite/workflow/build/test/contract-tester.test.ts