import { describe, expect, test, beforeEach, jest } from '@jest/globals';
import { runTests } from '@vscode/test-electron';
import { EnhancedLogger } from '../../src/utils/logger';
import { testRunner } from '../runTest';
import type { 
    TestResult, 
    MockLogger, 
    TestRunnerMock,
    LoggerMessageFunction,
    LoggerOperationFunction 
} from '../types';

// Mocking the logger
jest.mock('@vscode/test-electron', () => ({
    runTests: jest.fn() as TestRunnerMock
}));

jest.mock('../../src/utils/logger', () => ({
    EnhancedLogger: {
        getInstance: jest.fn().mockReturnValue({
            info: jest.fn().mockImplementation(
                (...args: any[]) => Promise.resolve()
            ),
            error: jest.fn().mockImplementation(
                (...args: any[]) => Promise.resolve()
            ),
            logOperation: jest.fn().mockImplementation(
                (...args: any[]) => {
                    const fn = args[2] as () => Promise<any>;
                    return Promise.resolve(fn());
                }
            )
        } as MockLogger)
    }
}));


describe('TestRunner', () => {
    let mockLogger: jest.Mocked<EnhancedLogger>;
    let mockRunTests: TestRunnerMock;

    beforeEach(() => {
        jest.clearAllMocks();
        mockRunTests = runTests as unknown as TestRunnerMock;
        mockLogger = EnhancedLogger.getInstance() as jest.Mocked<EnhancedLogger>;
    });


    test('executes test suite successfully', async () => {
        mockRunTests.mockResolvedValueOnce(0);

        const results = await testRunner.runTestSuite();

        expect(results).toHaveLength(1);
        expect(results[0].state).toBe('passed');
        expect(mockLogger.info).toHaveBeenCalledWith(
            expect.stringContaining('Test suite completed')
        );
    });

    test('handles test failures', async () => {
        const error = new Error('Test failure');
        mockRunTests.mockRejectedValueOnce(error);

        await expect(testRunner.runTestSuite()).rejects.toThrow('Test failure');
        expect(mockLogger.error).toHaveBeenCalledWith(
            expect.stringContaining('Test suite failed')
        );
    });

    test('configures test environment correctly', async () => {
        const customPath = '/custom/path';
        
        await testRunner.runTestSuite({
            workspacePath: customPath
        });
    
        expect(mockRunTests).toHaveBeenCalledWith(
            expect.objectContaining({
                extensionDevelopmentPath: expect.any(String),
                extensionTestsPath: expect.any(String),
                launchArgs: expect.arrayContaining([expect.any(String)]),
                workspacePath: customPath
            })
        );
    });
    

    test('tracks test execution metrics', async () => {
        mockRunTests.mockResolvedValueOnce(0);
        
        const results = await testRunner.runTestSuite();
        
        expect(results[0]).toMatchObject({
            duration: expect.any(Number),
            runStatus: expect.objectContaining({
                timestamp: expect.any(Number)
            })
        });
    });
});



// npm run test:suite -- tests/suite/runTest.test.ts
