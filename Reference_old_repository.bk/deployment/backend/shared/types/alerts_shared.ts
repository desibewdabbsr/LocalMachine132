export interface AlertThresholds {
    cpu_usage: number;
    memory_usage: number;
    disk_usage: number;
    network_latency: number;
    io_wait: number;
    swap_usage: number;
}

export type AlertSeverity = 'info' | 'warning' | 'critical' | 'error';

export interface AlertMetadata {
    source: string;
    category: 'system' | 'performance' | 'security' | 'resource';
    component: string;
    tags: string[];
}

export interface AlertDetails {
    metric: string;
    threshold: number;
    currentValue: number;
    unit?: string;
    trend?: 'increasing' | 'decreasing' | 'stable';
    additionalInfo?: Record<string, unknown>;
}

export interface SystemAlert {
    id: string;
    message: string;
    severity: AlertSeverity;
    timestamp: number;
    metadata: AlertMetadata;
    details: AlertDetails;
    acknowledged: boolean;
    resolvedAt?: number;
    resolution?: string;
}

export interface AlertConfig {
    thresholds: AlertThresholds;
    checkInterval: number;
    retentionPeriod: number;
    storageConfig: {
        path: string;
        format: 'json' | 'binary';
        compression: boolean;
    };
    notificationConfig: {
        enabled: boolean;
        channels: ('email' | 'slack' | 'webhook')[];
        minSeverity: AlertSeverity;
    };
}