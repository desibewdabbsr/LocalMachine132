/**
 * @jest-environment jsdom
 */

jest.mock('vscode', () => ({
    window: {
        withProgress: jest.fn((options, task) => task({ report: jest.fn() })),
        showInformationMessage: jest.fn()
    },
    ProgressLocation: {
        Notification: 1
    }
}));

jest.mock('../../../../../src/utils/logger', () => ({
    EnhancedLogger: {
        getInstance: jest.fn().mockReturnValue({
            info: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
            logOperation: jest.fn().mockImplementation(async (_, __, fn) => fn()),
            getConfig: jest.fn().mockReturnValue({
                logLevel: 'INFO',
                mode: 'development'
            })
        })
    }
}));

import { describe, expect, test, beforeEach } from '@jest/globals';
import { ContractTester } from '../../../../../src/workflow/build/test/contract-tester';
import { NetworkProvider } from '../../../../../src/services/network/network-provider';
import { ContractBuilder } from '../../../../../src/workflow/build/pipeline/contract-builder';
import { EnhancedLogger } from '../../../../../src/utils/logger';
import { ethers } from 'ethers';

describe('ContractTester', () => {
    let contractTester: ContractTester;
    let mockNetworkProvider: jest.Mocked<NetworkProvider>;
    let mockContractBuilder: jest.Mocked<ContractBuilder>;
    let mockLogger: jest.Mocked<EnhancedLogger>;

    const testConfig = {
        testPath: './test/Sample.test.sol',
        networkUrl: 'http://127.0.0.1:8545',
        gasLimit: 3000000
    };

    beforeEach(() => {
        mockNetworkProvider = {
            connect: jest.fn().mockResolvedValue(undefined),
            deploy: jest.fn().mockResolvedValue({
                interface: {
                    functions: {
                        'test_success()': {},
                        'test_revert()': {}
                    }
                },
                functions: {
                    'test_success()': jest.fn().mockResolvedValue({
                        wait: jest.fn().mockResolvedValue({ 
                            gasUsed: ethers.BigNumber.from(100000) 
                        })
                    }),
                    'test_revert()': jest.fn().mockRejectedValue(new Error('Test reverted'))
                }
            }),
            getNetworkProvider: jest.fn().mockResolvedValue(new ethers.providers.JsonRpcProvider())
        } as any;

        mockContractBuilder = {
            buildContract: jest.fn().mockResolvedValue({
                abi: [],
                bytecode: '0x',
                contractName: 'TestContract'
            })
        } as any;

        mockLogger = {
            debug: jest.fn(),
            info: jest.fn(),
            error: jest.fn(),
            logOperation: jest.fn().mockImplementation(async (_, __, fn) => fn())
        } as any;

        (EnhancedLogger.getInstance as jest.Mock).mockReturnValue(mockLogger);
        
        contractTester = new ContractTester(
            mockNetworkProvider,
            mockContractBuilder,
            testConfig
        );
    });

    test('initializes successfully', async () => {
        await contractTester.initialize();
        expect(mockNetworkProvider.connect).toHaveBeenCalledWith(testConfig.networkUrl);
        expect(mockLogger.info).toHaveBeenCalledWith('Contract tester initialized successfully');
    });

    test('runs tests successfully', async () => {
        await contractTester.initialize();
        const results = await contractTester.runTests();
    
        expect(results[0]).toEqual({
            passed: false,
            gasUsed: 100000,
            executionTime: expect.any(Number),
            errors: ['test_revert(): Error: Test reverted'],
            coverage: {
                branches: 0,
                functions: 0,
                lines: 0
            }
        });
    });
    

    test('handles initialization failures', async () => {
        const invalidTester = new ContractTester(
            mockNetworkProvider,
            mockContractBuilder,
            { testPath: '', networkUrl: '' }
        );

        await expect(invalidTester.initialize())
            .rejects.toThrow('Failed to initialize contract tester');
    });

    test('prevents testing before initialization', async () => {
        await expect(contractTester.runTests())
            .rejects.toThrow('Contract tester not initialized');
    });
});


// npm run test -- tests/suite/workflow/build/test/contract-tester.test.ts