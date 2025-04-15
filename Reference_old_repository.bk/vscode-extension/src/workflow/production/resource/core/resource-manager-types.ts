import { PerformanceMetrics } from '../.../../../../build/monitoring/performance-tracker';
import { LogLevel } from '../../../../../tests/types';


export interface ResourceConfig {
    memoryLimit: number;
    cpuThreshold: number;
    diskSpaceThreshold: number;
    monitoringInterval: number;
    autoScaleEnabled: boolean;
    logLevel: LogLevel;  // Uses LogLevel from types.ts which expects uppercase
}

export interface SystemMetrics {
    memory: MemoryMetrics;
    cpu: CPUMetrics;
    disk: DiskMetrics;
    timestamp: number;
}

export interface MemoryMetrics {
    used: number;
    total: number;
    percentage: number;
    heapStats: {
        heapUsed: number;
        heapTotal: number;
        external: number;
    };
}

export interface CPUMetrics {
    usage: number;
    loadAverage: number[];
    cores: number;
    speed: number;
}

export interface DiskMetrics {
    used: number;
    available: number;
    percentage: number;
    readSpeed: number;
    writeSpeed: number;
}

export interface ResourceMetrics extends SystemMetrics {
    performance: PerformanceMetrics;
}

export type ResourceMonitoringStatus = 'active' | 'paused' | 'error';

export interface ResourceAlert {
    type: 'memory' | 'cpu' | 'disk';
    severity: 'warning' | 'critical';
    message: string;
    timestamp: number;
    metrics: Partial<SystemMetrics>;
}

export interface ResourceThresholds {
    memory: {
        warning: number;   // Percentage threshold for memory warning (e.g. 70)
        critical: number;  // Percentage threshold for memory critical alert (e.g. 85)
    };
    cpu: {
        warning: number;   // Percentage threshold for CPU warning (e.g. 75)
        critical: number;  // Percentage threshold for CPU critical alert (e.g. 90)
    };
    disk: {
        warning: number;   // Percentage threshold for disk warning (e.g. 80)
        critical: number;  // Percentage threshold for disk critical alert (e.g. 95)
    };
}


export interface AnalysisResult {
    status: 'healthy' | 'warning' | 'critical';
    value: number;
    threshold: number;
    details: string;
}

export interface ResourceTrend {
    memory: 'increasing' | 'decreasing' | 'stable';
    cpu: 'increasing' | 'decreasing' | 'stable';
    disk: 'increasing' | 'decreasing' | 'stable';
}

export interface ResourceAnalysis {
    memory: AnalysisResult;
    cpu: AnalysisResult;
    disk: AnalysisResult;
    trends: ResourceTrend;
    timestamp: number;
    recommendations: string[];
}
