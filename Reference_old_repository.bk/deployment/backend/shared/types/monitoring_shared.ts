export interface MonitoringConfig {
    collection: CollectionConfig;
    storage: StorageConfig;
    analysis: AnalysisConfig;
    reporting: ReportingConfig;
}

export interface CollectionConfig {
    interval: number;
    batchSize: number;
    metrics: {
        system: boolean;
        process: boolean;
        network: boolean;
        custom: boolean;
    };
    priority: 'realtime' | 'high' | 'normal' | 'low';
}

export interface StorageConfig {
    path: string;
    format: 'json' | 'binary' | 'compressed';
    retention: {
        days: number;
        maxSize: number;
    };
    compression: {
        enabled: boolean;
        level: number;
    };
}

export interface AnalysisConfig {
    enabled: boolean;
    methods: ('trending' | 'anomaly' | 'threshold' | 'correlation')[];
    windows: {
        short: number;
        medium: number;
        long: number;
    };
    sensitivity: number;
}

export interface ReportingConfig {
    enabled: boolean;
    formats: ('json' | 'csv' | 'html')[];
    schedule: {
        frequency: 'hourly' | 'daily' | 'weekly';
        time?: string;
        day?: number;
    };
    destinations: ('file' | 'email' | 'api')[];
}

export interface MonitoringMetrics {
    id: string;
    timestamp: number;
    type: 'system' | 'process' | 'network' | 'custom';
    values: Record<string, number>;
    metadata: {
        source: string;
        tags: string[];
        priority: number;
    };
}

export interface MonitoringStatus {
    active: boolean;
    lastCheck: number;
    healthScore: number;
    metrics: {
        collected: number;
        processed: number;
        stored: number;
        errors: number;
    };
}