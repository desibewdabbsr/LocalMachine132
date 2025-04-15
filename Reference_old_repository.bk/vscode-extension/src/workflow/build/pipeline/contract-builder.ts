import { EnhancedLogger } from '../../../utils/logger';
import { CompilerService } from '../../../services/compiler/compiler-service';
import * as vscode from 'vscode';

interface BuildConfig {
    optimizerRuns: number;
    evmVersion: string;
    metadata: {
        useLiteralContent: boolean;
        bytecodeHash: 'ipfs' | 'bzzr1' | 'none';
    };
}

interface BuildResult {
    contractName: string;
    abi: any[];
    bytecode: string;
    deployedBytecode: string;
    buildInfo: {
        timestamp: number;
        duration: number;
        optimizer: boolean;
        evmVersion: string;
    };
}

export class ContractBuilder {
    private logger: EnhancedLogger;
    private isInitialized = false;

    constructor(
        private readonly compiler: CompilerService,
        private readonly config: BuildConfig = {
            optimizerRuns: 200,
            evmVersion: 'london',
            metadata: {
                useLiteralContent: true,
                bytecodeHash: 'ipfs'
            }
        }
    ) {
        this.logger = EnhancedLogger.getInstance();
    }

    async initialize(): Promise<void> {
        return this.logger.logOperation('contract-builder', 'initialize', async () => {
            try {
                await this.validateEnvironment();
                this.isInitialized = true;
                this.logger.info('Contract builder initialized successfully');
            } catch (error) {
                this.logger.error(`Contract builder initialization failed: ${error}`);
                throw new Error('Failed to initialize contract builder');
            }
        });
    }

    async buildContract(contractPath: string): Promise<BuildResult> {
        if (!this.isInitialized) {
            throw new Error('Contract builder not initialized');
        }

        return this.logger.logOperation('contract-builder', 'build', async () => {
            try {
                await this.validateContract(contractPath);
                const startTime = Date.now();
                const compiled = await this.compiler.compile(contractPath);

                const buildResult: BuildResult = {
                    contractName: compiled.contractName,
                    abi: compiled.abi,
                    bytecode: compiled.bytecode,
                    deployedBytecode: compiled.deployedBytecode || '',
                    buildInfo: {
                        timestamp: Date.now(),
                        duration: Date.now() - startTime,
                        optimizer: true,
                        evmVersion: this.config.evmVersion
                    }
                };

                this.logger.info(`Contract ${buildResult.contractName} built successfully`);
                return buildResult;
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                this.logger.error(`Contract build failed: ${errorMessage}`);
                throw new Error(`Build failed: ${errorMessage}`);
            }
        });
    }

    private async validateEnvironment(): Promise<void> {
        this.logger.debug('Validating build environment');
    }

    private async validateContract(contractPath: string): Promise<void> {
        this.logger.debug(`Validating contract: ${contractPath}`);
        if (!contractPath.endsWith('.sol')) {
            throw new Error('Invalid contract file type');
        }
    }
}


// npm run test -- tests/suite/workflow/build/pipeline/contract-builder.test.ts