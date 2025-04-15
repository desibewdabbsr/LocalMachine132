export const MONITORING_INTERVALS = {
    DEFAULT: {
        COLLECTION: 60000,    // 1 minute
        ANALYSIS: 300000,     // 5 minutes
        REPORTING: 3600000    // 1 hour
    },
    WINDOWS: {
        SHORT: 300000,        // 5 minutes
        MEDIUM: 3600000,      // 1 hour
        LONG: 86400000       // 24 hours
    },
    BATCH: {
        SIZE: 1000,
        TIMEOUT: 30000       // 30 seconds
    }
} as const;

export const MONITORING_METHODS = {
    ANALYSIS: {
        TRENDING: 'trending',
        ANOMALY: 'anomaly',
        THRESHOLD: 'threshold',
        CORRELATION: 'correlation'
    },
    COLLECTION: {
        POLLING: 'polling',
        EVENT_DRIVEN: 'event-driven',
        HYBRID: 'hybrid'
    }
} as const;

export const MONITORING_STORAGE = {
    FORMATS: {
        JSON: 'json',
        BINARY: 'binary',
        COMPRESSED: 'compressed'
    },
    COMPRESSION: {
        NONE: 0,
        FAST: 1,
        BALANCED: 6,
        MAX: 9
    },
    RETENTION: {
        RAW: 7,              // days
        AGGREGATED: 30,      // days
        ARCHIVED: 365        // days
    }
} as const;

export const MONITORING_STATUS = {
    HEALTH: {
        OPTIMAL: 1.0,
        GOOD: 0.8,
        WARNING: 0.6,
        CRITICAL: 0.4
    },
    STATES: {
        ACTIVE: 'active',
        PAUSED: 'paused',
        DEGRADED: 'degraded',
        ERROR: 'error'
    }
} as const;