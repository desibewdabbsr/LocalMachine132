import { EnhancedLogger } from '../../../utils/logger';
import { CompilerService } from '../../../services/compiler/compiler-service';
import * as vscode from 'vscode';
import { ethers } from 'ethers';

interface GasConfig {
    contractPath: string;
    networkUrl: string;
    optimizerRuns?: number;
    baseFeePerGas?: number;
    detailed?: boolean;
}

interface FunctionGasUsage {
    name: string;
    gasUsed: number;
    avgGasPerCall?: number;
    calls: number;
}

interface GasReport {
    contractName: string;
    deploymentCost: number;
    methodCosts: FunctionGasUsage[];
    totalGasUsed: number;
    avgGasPerTx: number;
    optimizationSuggestions?: string[];
}

export class GasReporter {
    private logger: EnhancedLogger;
    private compiler: CompilerService;
    private isInitialized = false;

    constructor(
        private readonly config: GasConfig
    ) {
        this.logger = EnhancedLogger.getInstance();
        this.compiler = new CompilerService();
    }

    async initialize(): Promise<void> {
        return this.logger.logOperation('gas-reporter', 'initialize', async () => {
            try {
                await this.validateConfig();
                this.isInitialized = true;
                this.logger.info('Gas reporter initialized successfully');
            } catch (error) {
                this.logger.error(`Gas reporter initialization failed: ${error}`);
                throw new Error('Failed to initialize gas reporter');
            }
        });
    }

    async generateReport(): Promise<GasReport> {
        if (!this.isInitialized) {
            throw new Error('Gas reporter not initialized');
        }

        return this.logger.logOperation('gas-reporter', 'generate-report', async () => {
            return await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: 'Generating Gas Report',
                cancellable: false
            }, async (progress) => {
                try {
                    progress.report({ message: 'Compiling contract', increment: 20 });
                    const compiled = await this.compiler.compile(this.config.contractPath);

                    progress.report({ message: 'Analyzing bytecode', increment: 30 });
                    const bytecodeAnalysis = await this.analyzeBytecode(compiled.bytecode);

                    progress.report({ message: 'Profiling functions', increment: 30 });
                    const functionProfiles = await this.profileFunctions(compiled.abi);

                    progress.report({ message: 'Generating suggestions', increment: 20 });
                    const suggestions = this.generateOptimizationSuggestions(bytecodeAnalysis);

                    return {
                        contractName: compiled.contractName,
                        deploymentCost: bytecodeAnalysis.deploymentCost,
                        methodCosts: functionProfiles,
                        totalGasUsed: this.calculateTotalGas(functionProfiles),
                        avgGasPerTx: this.calculateAverageGas(functionProfiles),
                        optimizationSuggestions: suggestions
                    };
                } catch (error) {
                    this.logger.error(`Gas report generation failed: ${error}`);
                    throw new Error('Failed to generate gas report');
                }
            });
        });
    }

    private async validateConfig(): Promise<void> {
        if (!this.config.contractPath || !this.config.networkUrl) {
            throw new Error('Invalid gas reporter configuration');
        }
    }

    private async analyzeBytecode(bytecode: string): Promise<{ deploymentCost: number }> {
        const bytecodeSize = (bytecode.length - 2) / 2; // Remove '0x' and convert to bytes
        const deploymentCost = bytecodeSize * 200; // Basic gas cost estimation
        return { deploymentCost };
    }

    private async profileFunctions(abi: any[]): Promise<FunctionGasUsage[]> {
        return abi
            .filter(item => item.type === 'function')
            .map(func => ({
                name: func.name,
                gasUsed: this.estimateFunctionGas(func),
                calls: 0,
                avgGasPerCall: 0
            }));
    }

    private estimateFunctionGas(func: any): number {
        // Basic gas estimation based on function type
        if (func.stateMutability === 'view' || func.stateMutability === 'pure') {
            return 21000;
        }
        return 50000; // Default estimation for state-changing functions
    }

    private calculateTotalGas(functionProfiles: FunctionGasUsage[]): number {
        return functionProfiles.reduce((total, profile) => total + profile.gasUsed, 0);
    }

    private calculateAverageGas(functionProfiles: FunctionGasUsage[]): number {
        const totalGas = this.calculateTotalGas(functionProfiles);
        return functionProfiles.length > 0 ? totalGas / functionProfiles.length : 0;
    }

    private generateOptimizationSuggestions(bytecodeAnalysis: { deploymentCost: number }): string[] {
        const suggestions: string[] = [];
        
        if (bytecodeAnalysis.deploymentCost > 1000000) {
            suggestions.push('Consider splitting contract into smaller components');
        }
        
        if (!this.config.optimizerRuns) {
            suggestions.push('Enable the optimizer to reduce gas costs');
        }

        return suggestions;
    }
}

// npm run test -- tests/suite/workflow/build/test/gas-reporter.test.ts