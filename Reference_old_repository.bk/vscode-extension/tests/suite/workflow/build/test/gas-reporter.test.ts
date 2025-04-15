/**
 * @jest-environment jsdom
 */

jest.mock('vscode', () => ({
    window: {
        withProgress: jest.fn((options, task) => task({ 
            report: jest.fn()
        })),
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
import { GasReporter } from '../../../../../src/workflow/build/test/gas-reporter';
import { CompilerService } from '../../../../../src/services/compiler/compiler-service';
import { EnhancedLogger } from '../../../../../src/utils/logger';
import { ethers } from 'ethers';

describe('GasReporter', () => {
    let reporter: GasReporter;
    let mockCompilerService: jest.Mocked<CompilerService>;
    let mockLogger: jest.Mocked<EnhancedLogger>;

    const testConfig = {
        contractPath: './test/Sample.sol',
        networkUrl: 'http://127.0.0.1:8545',
        optimizerRuns: 200
    };

    beforeEach(() => {
        mockCompilerService = {
            compile: jest.fn().mockResolvedValue({
                contractName: 'TestContract',
                abi: [
                    {
                        type: 'function',
                        name: 'transfer',
                        stateMutability: 'nonpayable'
                    }
                ],
                bytecode: '0x608060405234801561001057600080fd5b50610'
            })
        } as any;

        mockLogger = {
            debug: jest.fn(),
            info: jest.fn(),
            error: jest.fn(),
            logOperation: jest.fn().mockImplementation(async (_, __, fn) => fn())
        } as any;

        (EnhancedLogger.getInstance as jest.Mock).mockReturnValue(mockLogger);
        (CompilerService as jest.Mock) = jest.fn().mockImplementation(() => mockCompilerService);
        
        reporter = new GasReporter(testConfig);
    });

    test('initializes successfully', async () => {
        await reporter.initialize();
        expect(mockLogger.info).toHaveBeenCalledWith('Gas reporter initialized successfully');
    });

    test('generates gas report successfully', async () => {
        await reporter.initialize();
        const report = await reporter.generateReport();

        expect(report).toEqual(expect.objectContaining({
            contractName: 'TestContract',
            deploymentCost: expect.any(Number),
            methodCosts: expect.arrayContaining([
                expect.objectContaining({
                    name: 'transfer',
                    gasUsed: expect.any(Number)
                })
            ]),
            totalGasUsed: expect.any(Number),
            avgGasPerTx: expect.any(Number)
        }));
    });

    test('handles initialization failures', async () => {
        const invalidReporter = new GasReporter({ contractPath: '', networkUrl: '' });
        await expect(invalidReporter.initialize())
            .rejects.toThrow('Failed to initialize gas reporter');
    });

    test('prevents report generation before initialization', async () => {
        await expect(reporter.generateReport())
            .rejects.toThrow('Gas reporter not initialized');
    });

    test('generates optimization suggestions', async () => {
        await reporter.initialize();
        const report = await reporter.generateReport();
        
        expect(report.optimizationSuggestions).toBeDefined();
        expect(Array.isArray(report.optimizationSuggestions)).toBe(true);
    });
});


// npm run test -- tests/suite/workflow/build/test/gas-reporter.test.ts