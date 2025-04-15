import * as path from 'path';
import * as glob from 'glob';
import { EventEmitter } from 'events';
import { TestResult, TestSuiteConfig } from '../types';

export class TestSuiteRunner extends EventEmitter {
    private testResults: TestResult[] = [];

    constructor(private config: TestSuiteConfig = {
        timeout: 60000,
        parallel: true,
        bail: false,
        reporterOptions: {
            output: 'test-results.json'
        }
    }) {
        super();
    }

    public async run(): Promise<TestResult[]> {
        const testsRoot = path.resolve(__dirname, '.');
        
        try {
            this.emit('testStart');
            await this.setupTestEnvironment();
            const results = await this.executeTests();
            this.emit('testComplete', results);
            return results;
        } catch (err) {
            this.emit('testError', err);
            throw err;
        }
    }

    private setupTestEnvironment(): void {
        process.env.NODE_ENV = 'test';
        process.env.VSCODE_TEST = 'true';
        
        if (this.config.timeout) {
            jest.setTimeout(this.config.timeout);
        }
    }

    private async executeTests(): Promise<TestResult[]> {
        return this.testResults;
    }

    public getCurrentResults(): TestResult[] {
        return [...this.testResults];
    }

    public resetResults(): void {
        this.testResults = [];
    }
}



export async function run(): Promise<TestResult[]> {
    const runner = createTestRunner();
    return runner.run();
}



export function createTestRunner(config?: TestSuiteConfig): TestSuiteRunner {
    return new TestSuiteRunner(config);
}




// npm run test:suite
