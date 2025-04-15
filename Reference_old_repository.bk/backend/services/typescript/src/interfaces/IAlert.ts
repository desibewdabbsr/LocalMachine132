export interface AlertDetails {
    metric: string;
    threshold: number;
    currentValue: number;
}

export interface SystemAlert {
    id: string;
    message: string;
    severity: 'info' | 'warning' | 'critical';
    timestamp: number;
    source: string;
    details?: AlertDetails;
}

export interface AlertConfig {
    thresholds: {
        cpu_usage: number;
        memory_usage: number;
        disk_usage: number;
        network_latency: number;
    };
    storagePath: string;
    retentionDays: number;
    checkInterval: number;
    alertLevels: Array<'info' | 'warning' | 'critical'>;
}