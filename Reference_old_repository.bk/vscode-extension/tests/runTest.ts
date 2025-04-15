import * as path from 'path';
import { runTests,} from '@vscode/test-electron';
import { EnhancedLogger } from '../src/utils/logger';
import { ConfigManager } from '../src/config/config_manager';
import type { TestRunnerOptions, TestResult } from './types';
import type { TestOptions } from './types';  // Use our extended interface

class TestRunner {
    private readonly logger = EnhancedLogger.getInstance();
    private readonly config = ConfigManager.getInstance();
    private readonly extensionDevelopmentPath: string;
    private readonly extensionTestsPath: string;
    private readonly defaultWorkspace: string;

    constructor() {
        this.extensionDevelopmentPath = path.resolve(__dirname, '../');
        this.extensionTestsPath = path.resolve(__dirname, './suite/index');
        this.defaultWorkspace = path.resolve(__dirname, '../test-workspace');
    }

    
    public async runTestSuite(options: Partial<TestRunnerOptions> = {}): Promise<TestResult[]> {
        const startTime = Date.now();
        const executionId = `test-run-${Date.now()}`;
    
        try {
            await this.logger.logOperation('test-runner', 'initialize', async () => {
                await this.logger.info(`Starting test suite - ID: ${executionId}`);
                return await this.createTestConfiguration(options);
            });
    
            const exitCode = await this.executeTests({
                ...this.createBaseConfig(),
                ...options
            });
    
            return await this.processTestResults(exitCode, startTime, executionId);
    
        } catch (err) {
            await this.handleTestError(err as Error, executionId);
            throw err;
        }
    }
    

    private async createTestConfiguration(options: Partial<TestRunnerOptions>): Promise<TestOptions> {
        const workspacePath = options.workspacePath || this.defaultWorkspace;
        
        return {
            extensionDevelopmentPath: this.extensionDevelopmentPath,
            extensionTestsPath: this.extensionTestsPath,
            launchArgs: [
                workspacePath,
                '--disable-extensions',
                '--disable-gpu',
                '--no-sandbox',
                ...(options.launchArgs || [])
            ]
            // Remove workspacePath as it's now handled in launchArgs
        };
    }

    private createBaseConfig(): TestOptions {
        return {
            extensionDevelopmentPath: this.extensionDevelopmentPath,
            extensionTestsPath: this.extensionTestsPath,
            launchArgs: [this.defaultWorkspace]
        };
    }

    private async executeTests(config: TestOptions): Promise<number> {
        return await this.logger.logOperation('test-runner', 'execute', async () => {
            try {
                return await runTests(config);
            } catch (error) {
                await this.logger.error(`Test execution failed: ${(error as Error).message}`);
                throw error;
            }
        });
    }







    private async processTestResults(exitCode: number, startTime: number, executionId: string): Promise<TestResult[]> {
        return await this.logger.logOperation('test-runner', 'process-results', async () => {
            const duration = Date.now() - startTime;
            const results: TestResult[] = [{
                title: 'VSCode Extension Tests',
                state: exitCode === 0 ? 'passed' : 'failed',
                duration,
                runStatus: {
                    exitCode,
                    success: exitCode === 0,
                    timestamp: Date.now()
                }
            }];
    
            await this.logger.info(`Test suite completed - ID: ${executionId} - Success: ${exitCode === 0}`);
            return results;
        });
    }
    
    private async handleTestError(error: Error, executionId: string): Promise<void> {
        await this.logger.logOperation('test-runner', 'error-handling', async () => {
            await this.logger.error(`Test suite failed - ID: ${executionId} - Error: ${error.message}`);
        });
    }
    




}

export const testRunner = new TestRunner();
export const runTestSuite = testRunner.runTestSuite.bind(testRunner);

// Direct execution
if (require.main === module) {
    testRunner.runTestSuite().catch(err => {
        console.error('Test execution failed:', err);
        process.exit(1);
    });
}




// npm install vscode-test mocha @types/mocha glob @types/glob --save-dev

// npm run test:suite -- tests/suite/runTest.test.ts
