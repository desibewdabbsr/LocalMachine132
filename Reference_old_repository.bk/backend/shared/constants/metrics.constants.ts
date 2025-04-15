export const METRICS_INTERVALS = {
    COLLECTION: {
        DEFAULT: 5000,
        MINIMUM: 1000,
        MAXIMUM: 300000
    },
    BATCH: {
        SIZE: 100,
        TIMEOUT: 30000
    },
    RETENTION: {
        DAYS: 30,
        MAX_FILE_SIZE: 1024 * 1024 * 10 // 10MB
    }
} as const;

export const METRICS_THRESHOLDS = {
    CPU: {
        WARNING: 70,
        CRITICAL: 90,
        SAMPLING_RATE: 1000
    },
    MEMORY: {
        WARNING: 80,
        CRITICAL: 95,
        MIN_FREE: 1024 * 1024 * 512 // 512MB
    },
    DISK: {
        WARNING: 85,
        CRITICAL: 95,
        MIN_FREE: 1024 * 1024 * 1024 // 1GB
    },
    NETWORK: {
        LATENCY_WARNING: 100, // ms
        LATENCY_CRITICAL: 200, // ms
        PACKET_LOSS_WARNING: 1, // percentage
        PACKET_LOSS_CRITICAL: 5 // percentage
    }
} as const;

export const METRICS_FORMATS = {
    JSON: 'json',
    BINARY: 'binary',
    COMPRESSED: 'compressed'
} as const;

export const METRICS_PRIORITIES = {
    REALTIME: 0,
    HIGH: 1,
    NORMAL: 2,
    LOW: 3
} as const;