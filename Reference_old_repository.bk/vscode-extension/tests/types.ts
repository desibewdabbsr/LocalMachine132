import type { jest } from '@jest/globals';
import { TestOptions as VSCodeTestOptions } from '@vscode/test-electron';



export interface TestOptions extends VSCodeTestOptions {
    workspacePath?: string;
}

export interface TestRunnerOptions {
    workspacePath?: string;
    extensionDevelopmentPath: string | string[];
    extensionTestsPath: string;
    launchArgs?: string[];
    env?: NodeJS.ProcessEnv;
    version?: string;
}

export interface TestResult {
    title: string;
    state?: 'passed' | 'failed' | 'pending';
    duration?: number;
    file?: string;
    error?: {
        message: string;
        stack?: string;
    };
    runStatus?: {
        exitCode: number;
        success: boolean;
        timestamp: number;
    };
}



export interface TestSuiteConfig {
    timeout?: number;
    parallel?: boolean;
    bail?: boolean;
    reporterOptions?: {
        output: string;
    };
}

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export interface LoggerConfig {
    mode: 'development' | 'production';
    metricsEnabled: boolean;
    mockEnabled: boolean;
    mockResponsePath: string;
    logLevel: LogLevel;
    retentionDays: number;
}



export interface OutputChannel {
    name: string;
    appendLine(value: string): void;
    append(value: string): void;
    clear(): void;
    show(): void;
    hide(): void;
    dispose(): void;
}

export interface Progress<T> {
    report(value: { increment?: number; message?: string }): void;
}

export interface ProgressOptions {
    location: number;
    title: string;
    cancellable: boolean;
}



export interface PerformanceMetric {
    startTime: number;
    endTime: number;
    duration: number;
    success: boolean;
    metadata?: any;
}

export interface MetricCategory {
    [key: string]: PerformanceMetric;
}

export interface MetricsMap {
    [category: string]: MetricCategory;
}



export interface TestRunnerOptions extends Partial<TestOptions> {
    workspacePath?: string;
    env?: NodeJS.ProcessEnv;
    version?: string;
}




export interface MockFunction {
    (...args: any[]): any;
    calls: any[];
    returnValue?: any;
    implementation?: (...args: any[]) => any;
    mockReturnValue(value: any): this;
    mockImplementation(fn: (...args: any[]) => any): this;
    mockClear(): this;
    mockReset(): this;
}



export interface MockFunction extends jest.Mock {
    calls: any[];
    returnValue?: any;
    implementation?: (...args: any[]) => any;
    mockReturnValue(value: any): MockFunction;
    mockImplementation(fn: (...args: any[]) => any): MockFunction;
}

export interface TestRunnerOptions extends TestOptions {
    workspacePath?: string;
    extensionDevelopmentPath: string | string[];
    extensionTestsPath: string;
    launchArgs?: string[];
    env?: NodeJS.ProcessEnv;
    version?: string;
}

export interface TestResult {
    title: string;
    state?: 'passed' | 'failed' | 'pending';
    duration?: number;
    file?: string;
    error?: {
        message: string;
        stack?: string;
    };
}



export interface ExtensionConfig {
    mode: 'development' | 'production';
    metricsEnabled: boolean;
    mockEnabled: boolean;
    mockResponsePath: string;
    logLevel: LogLevel;
    retentionDays: number;
    security: {
        analysisEnabled: boolean;
        vulnerabilityScanLevel: 'basic' | 'deep';
        autoFix: boolean;
    };
    cody: {
        endpoint: string;
        timeout: number;
        retryAttempts: number;
    };
    toolchain: {
        rust: {
            channel: string;
            components: string[];
        };
        solidity: {
            version: string;
            optimizer: boolean;
        };
    };
}


export interface PerformanceMetric {
    startTime: number;
    endTime: number;
    duration: number;
    success: boolean;
    operationId?: string;
    metadata?: any;
    error?: any;
}

export interface MockOutputChannel extends OutputChannel {
    messages: string[];
    mock: {
        calls: any[][];
    };
}

export interface VSCodeTestMock extends jest.Mock {
    mockResolvedValue(value: number): this;
    mockRejectedValue(error: Error): this;
}


export interface ILogger {
    info(message: string): Promise<void>;
    error(message: string): Promise<void>;
    logOperation<T>(category: string, operation: string, func: () => Promise<T>): Promise<T>;
}




export interface MockLogger {
    info: jest.MockedFunction<(message: string) => Promise<void>>;
    error: jest.MockedFunction<(message: string) => Promise<void>>;
    logOperation: jest.MockedFunction<
        <T>(category: string, operation: string, func: () => Promise<T>) => Promise<T>
    >;
}

export interface TestRunnerMock extends jest.Mock {
    mockResolvedValue(value: number): this;
    mockResolvedValueOnce(value: number): this;
    mockRejectedValue(error: Error): this;
    mockRejectedValueOnce(error: Error): this;
}



// Base function types
export type LoggerMessageFunction = (message: string) => Promise<void>;
export type LoggerOperationFunction = <T>(
    category: string, 
    operation: string, 
    func: () => Promise<T>
) => Promise<T>;

// Mock types
export interface MockLogger {
    info: jest.MockedFunction<LoggerMessageFunction>;
    error: jest.MockedFunction<LoggerMessageFunction>;
    logOperation: jest.MockedFunction<LoggerOperationFunction>;
}

// Test runner mock
export interface TestRunnerMock extends jest.Mock {
    mockResolvedValue(value: number): this;
    mockResolvedValueOnce(value: number): this;
    mockRejectedValue(error: Error): this;
    mockRejectedValueOnce(error: Error): this;
}




//testHelpper.ts


export interface TestProgress {
    message: string;
    increment: number;
    total: number;
    currentStep: number;
}

// export interface TestResult {
//     success: boolean;
//     message: string;
//     duration: number;
//     details?: {
//         errors?: string[];
//         warnings?: string[];
//         metrics?: Record<string, number>;
//     };
// }

export interface TestOperation {
    name: string;
    run: () => Promise<void>;
    cleanup?: () => Promise<void>;
}


export interface HardwareConfig {
    device: 'cpu' | 'cuda';
    threads: number;
    memoryLimit: number;
    batchSize: number;
    memoryAllocation: 'dynamic' | 'static';
    cudaCores: number;
    cpuArchitecture: 'x86' | 'arm' | 'auto';
    multiGpu: boolean;
    performanceMode: 'low' | 'balanced' | 'performance';
}
