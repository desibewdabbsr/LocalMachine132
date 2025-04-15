export const ALERT_LEVELS = {
    SEVERITY: {
        INFO: 0,
        LOW: 1,
        MEDIUM: 2,
        HIGH: 3,
        CRITICAL: 4
    },
    PRIORITY: {
        ROUTINE: 0,
        IMPORTANT: 1,
        URGENT: 2,
        EMERGENCY: 3
    }
} as const;

export const ALERT_THRESHOLDS = {
    SYSTEM: {
        CPU_USAGE: {
            WARNING: 75,
            CRITICAL: 90,
            DURATION: 300000 // 5 minutes
        },
        MEMORY_USAGE: {
            WARNING: 80,
            CRITICAL: 95,
            MIN_FREE: 536870912 // 512MB
        },
        DISK_USAGE: {
            WARNING: 85,
            CRITICAL: 95,
            MIN_FREE: 1073741824 // 1GB
        },
        NETWORK: {
            LATENCY: {
                WARNING: 100, // ms
                CRITICAL: 200 // ms
            },
            PACKET_LOSS: {
                WARNING: 2, // percentage
                CRITICAL: 5 // percentage
            }
        }
    },
    PERFORMANCE: {
        RESPONSE_TIME: {
            WARNING: 2000, // ms
            CRITICAL: 5000 // ms
        },
        ERROR_RATE: {
            WARNING: 5, // percentage
            CRITICAL: 10 // percentage
        },
        THROUGHPUT: {
            WARNING: 1000, // requests/second
            CRITICAL: 500 // requests/second
        }
    }
} as const;

export const ALERT_ACTIONS = {
    NOTIFICATION: {
        EMAIL: 'email',
        SLACK: 'slack',
        WEBHOOK: 'webhook',
        SMS: 'sms'
    },
    RESPONSE: {
        LOG: 'log',
        RESTART: 'restart',
        SCALE: 'scale',
        FAILOVER: 'failover'
    },
    STATUS: {
        NEW: 'new',
        ACKNOWLEDGED: 'acknowledged',
        IN_PROGRESS: 'in_progress',
        RESOLVED: 'resolved',
        CLOSED: 'closed'
    }
} as const;

export const ALERT_SETTINGS = {
    INTERVALS: {
        CHECK: 60000, // 1 minute
        CLEANUP: 86400000, // 24 hours
        RETENTION: 2592000000 // 30 days
    },
    BATCH: {
        SIZE: 100,
        TIMEOUT: 30000 // 30 seconds
    },
    AGGREGATION: {
        TIME_WINDOW: 300000, // 5 minutes
        MAX_SIMILAR: 10
    }
} as const;