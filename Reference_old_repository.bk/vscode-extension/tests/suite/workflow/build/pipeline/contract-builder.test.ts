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
import { ContractBuilder } from '../../../../../src/workflow/build/pipeline/contract-builder';
import { CompilerService } from '../../../../../src/services/compiler/compiler-service';
import { EnhancedLogger } from '../../../../../src/utils/logger';
import * as vscode from 'vscode';

describe('ContractBuilder', () => {
    let contractBuilder: ContractBuilder;
    let mockCompiler: jest.Mocked<CompilerService>;
    let mockLogger: jest.Mocked<EnhancedLogger>;

    beforeEach(() => {
        mockCompiler = {
            compile: jest.fn().mockResolvedValue({
                contractName: 'TestContract',
                abi: [],
                bytecode: '0x',
                deployedBytecode: '0x'
            })
        } as any;

        mockLogger = {
            debug: jest.fn(),
            info: jest.fn(),
            error: jest.fn(),
            logOperation: jest.fn().mockImplementation(async (_, __, fn) => fn())
        } as any;

        (EnhancedLogger.getInstance as jest.Mock).mockReturnValue(mockLogger);
        contractBuilder = new ContractBuilder(mockCompiler);
    });

    test('initializes successfully', async () => {
        await contractBuilder.initialize();
        expect(mockLogger.info).toHaveBeenCalledWith('Contract builder initialized successfully');
    });

    test('builds contract successfully', async () => {
        await contractBuilder.initialize();
        const result = await contractBuilder.buildContract('Test.sol');

        expect(result).toEqual(expect.objectContaining({
            contractName: 'TestContract',
            abi: expect.any(Array),
            bytecode: expect.any(String)
        }));
    });

    test('handles build failures gracefully', async () => {
        await contractBuilder.initialize();
        mockCompiler.compile.mockRejectedValueOnce(new Error('Compilation failed'));

        await expect(contractBuilder.buildContract('Test.sol'))
            .rejects.toThrow('Build failed: Compilation failed');
    });

    test('validates contract file type', async () => {
        await contractBuilder.initialize();
        await expect(contractBuilder.buildContract('invalid.txt'))
            .rejects.toThrow('Invalid contract file type');
    });
});


// npm run test -- tests/suite/workflow/build/pipeline/contract-builder.test.ts