import { EnhancedLogger } from './utils/logger';
import * as vscode from 'vscode';
import { TestProgress, TestResult, TestOperation } from '../tests/types';

export class TestHelper {
    private logger: EnhancedLogger;
    private progress: vscode.Progress<{message?: string; increment?: number}>;
    private readonly operationTimeout = 30000;

    constructor(progress?: vscode.Progress<{message?: string; increment?: number}>) {
        this.logger = EnhancedLogger.getInstance();
        this.progress = progress || this.createMockProgress();
    }

    async runTestOperation(operation: TestOperation): Promise<TestResult> {
        const startTime = Date.now();
        
        try {
            await this.logger.logOperation('test', operation.name, async () => {
                await Promise.race([
                    operation.run(),
                    this.createTimeout(this.operationTimeout)
                ]);
            });
    
            return {
                title: operation.name,
                state: 'passed',
                duration: Date.now() - startTime,
                file: operation.name,
                runStatus: {
                    exitCode: 0,
                    success: true,
                    timestamp: Date.now()
                }
            };
        } catch (err: unknown) {
            return {
                title: operation.name,
                state: 'failed',
                duration: Date.now() - startTime,
                file: operation.name,
                error: {
                    message: err instanceof Error ? err.message : 'Unknown error occurred',
                    stack: err instanceof Error ? err.stack : undefined
                },
                runStatus: {
                    exitCode: 1,
                    success: false,
                    timestamp: Date.now()
                }
            };
        } finally {
            if (operation.cleanup) {
                await operation.cleanup();
            }
        }
    }

    async reportProgress(progress: TestProgress): Promise<void> {
        this.progress.report({
            message: `${progress.message} (${progress.currentStep}/${progress.total})`,
            increment: progress.increment
        });
        
        await this.logger.logOperation('progress', 'update', async () => {
            await new Promise(resolve => setTimeout(resolve, 0));
        });
    }

    private createTimeout(ms: number): Promise<never> {
        return new Promise((_, reject) => {
            const timer = setTimeout(() => {
                reject(new Error(`Operation timed out after ${ms}ms`));
            }, ms);
            timer.unref();
        });
    }

    private createMockProgress(): vscode.Progress<{message?: string; increment?: number}> {
        return {
            report: () => {}
        };
    }

    async validateTestEnvironment(): Promise<void> {
        const checks = [
            this.checkFileSystem(),
            this.checkPermissions(),
            this.checkDependencies()
        ];

        await Promise.all(checks);
    }

    private async checkFileSystem(): Promise<void> {
        // Implementation for filesystem checks
    }

    private async checkPermissions(): Promise<void> {
        // Implementation for permission checks
    }

    private async checkDependencies(): Promise<void> {
        // Implementation for dependency checks
    }
}