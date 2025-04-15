jest.mock('solc', () => ({
    compile: jest.fn()
}));

jest.mock('fs-extra', () => ({
    readFile: jest.fn()
}));

import { describe, expect, test, beforeEach, jest } from '@jest/globals';
import { CompilerService } from '../../../src/services/compiler/compiler-service';
import * as solc from 'solc';
import * as fs from 'fs-extra';

describe('CompilerService', () => {
    let compilerService: CompilerService;
    const mockContractPath = '/test/Contract.sol';
    const mockSource = 'contract Test { }';
    
    beforeEach(() => {
        jest.resetAllMocks();
        compilerService = new CompilerService();
        ((fs.readFile as unknown) as jest.MockedFunction<any>).mockResolvedValue(mockSource);
    });

    test('compiles contract successfully', async () => {
        const mockOutput = {
            contracts: {
                'Contract.sol': {
                    'Test': {
                        abi: [],
                        evm: {
                            bytecode: { object: '0x123' },
                            deployedBytecode: { object: '0x456' },
                            sourceMap: '0:0:0'
                        }
                    }
                }
            }
        };

        ((solc.compile as unknown) as jest.MockedFunction<any>).mockReturnValue(JSON.stringify(mockOutput));

        const result = await compilerService.compile(mockContractPath);
        expect(result).toEqual({
            contractName: 'Test',
            abi: [],
            bytecode: '0x123',
            deployedBytecode: '0x456',
            sourceMap: '0:0:0',
            errors: undefined
        });
    });

    test('handles compilation errors', async () => {
        const mockError = {
            errors: [{
                type: 'Error',
                message: 'Compilation failed'
            }]
        };

        (solc.compile as jest.Mock).mockReturnValue(JSON.stringify(mockError));

        await expect(compilerService.compile(mockContractPath))
            .rejects
            .toThrow('Compilation failed');
    });

    test('verifies bytecode successfully', async () => {
        const mockOutput = {
            contracts: {
                'Contract.sol': {
                    'Test': {
                        abi: [],
                        evm: {
                            bytecode: { object: '0x123' },
                            deployedBytecode: { object: '0x456' },
                            sourceMap: '0:0:0'
                        }
                    }
                }
            }
        };

        (solc.compile as jest.Mock).mockReturnValue(JSON.stringify(mockOutput));

        const result = await compilerService.verifyBytecode(mockContractPath, '0x456');
        expect(result).toBe(true);
    });

    test('retrieves ABI successfully', async () => {
        const mockABI = [{
            type: 'function',
            name: 'test',
            inputs: [],
            outputs: []
        }];

        const mockOutput = {
            contracts: {
                'Contract.sol': {
                    'Test': {
                        abi: mockABI,
                        evm: {
                            bytecode: { object: '0x123' },
                            deployedBytecode: { object: '0x456' },
                            sourceMap: '0:0:0'
                        }
                    }
                }
            }
        };

        (solc.compile as jest.Mock).mockReturnValue(JSON.stringify(mockOutput));

        const result = await compilerService.getABI(mockContractPath);
        expect(result).toEqual(mockABI);
    });
});