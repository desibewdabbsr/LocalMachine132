import { ethers } from 'ethers';
import * as solc from 'solc';
import * as fs from 'fs-extra';
import * as path from 'path';

interface CompilerError {
    type: string;
    message: string;
}

interface CompilerOutput {
    contractName: string;
    abi: any[];
    bytecode: string;
    deployedBytecode?: string;
    sourceMap?: string;
    errors?: CompilerError[];
}


export interface CompilationResult {
    status: 'success' | 'failed';
    output?: string;
    error?: string;
}


export class CompilerService {
    private defaultSettings = {
        optimizer: {
            enabled: true,
            runs: 200
        },
        evmVersion: 'london'
    };


    async compile(contractPath: string): Promise<CompilerOutput> {
        try {
            const source = await fs.readFile(contractPath, 'utf8');
            const fileName = path.basename(contractPath);
            
            const input = {
                language: 'Solidity',
                sources: {
                    [fileName]: {
                        content: source
                    }
                },
                settings: {
                    ...this.defaultSettings,
                    outputSelection: {
                        '*': {
                            '*': ['abi', 'evm.bytecode', 'evm.deployedBytecode', 'evm.sourceMap']
                        }
                    }
                }
            };

            const output = JSON.parse(solc.compile(JSON.stringify(input)));

            if (output.errors?.some((error: CompilerError) => error.type === 'Error')) {
                throw new Error(
                    `Compilation failed: ${output.errors.map((e: CompilerError) => e.message).join('\n')}`
                );
            }

            const contractFile = Object.keys(output.contracts)[0];
            const contractName = Object.keys(output.contracts[contractFile])[0];
            const contract = output.contracts[contractFile][contractName];

            return {
                contractName,
                abi: contract.abi,
                bytecode: contract.evm.bytecode.object,
                deployedBytecode: contract.evm.deployedBytecode.object,
                sourceMap: contract.evm.sourceMap,
                errors: output.errors
            };
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error(`Compilation error: ${error.message}`);
            }
            throw new Error('Unknown compilation error occurred');
        }
    }

    async verifyBytecode(contractPath: string, deployedBytecode: string): Promise<boolean> {
        const compiled = await this.compile(contractPath);
        return compiled.deployedBytecode === deployedBytecode;
    }

    async getABI(contractPath: string): Promise<any[]> {
        const compiled = await this.compile(contractPath);
        return compiled.abi;
    }
}


// npm run test:suite -- tests/suite/services/compiler-service.test.ts