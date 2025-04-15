// import { LogLevel } from '../../../tests/types';

export interface LogMetadata {
    timestamp: string;
    correlationId: string;
    component: string;
    operation: string;
    metrics?: PerformanceMetric;
}

export interface PerformanceMetric {
    startTime: number;
    endTime: number;
    duration: number;
    success: boolean;
    error?: unknown;  // Add error property
    metadata?: Record<string, unknown>;

}

export interface SecurityAudit {
    action: string;
    resource: string;
    outcome: string;
    risk?: 'LOW' | 'MEDIUM' | 'HIGH';
    metadata?: Record<string, unknown>;
}

export interface AIOperation {
    model: string;
    prompt: string;
    duration: number;
    tokens: number;
}

export interface LoggerConfig {
    logLevel: LogLevel;
    retentionDays: number;
    metricsEnabled: boolean;
}


export interface MetricEntry {
    timestamp: string;
    metrics: {
        startTime: number;
        endTime: number;
        duration: number;
        success: boolean;
        metadata?: any;
    };
}





export interface MockFsModule {
    writeJSON: jest.Mock;
    readJSON: jest.Mock;
    appendFile: jest.Mock;
    ensureDir: jest.Mock;
    ensureDirSync: jest.Mock;
    pathExists: jest.Mock;
}


export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';


