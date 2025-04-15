export const SYSTEM_RESOURCES = {
    CPU: {
        MIN_CORES: 2,
        THREAD_MULTIPLIER: 2,
        FREQUENCY_SCALING: {
            MIN: 800,    // MHz
            MAX: 5000,   // MHz
            TURBO_BOOST: true
        },
        ARCHITECTURE: ['x86_64', 'arm64', 'aarch64'] as const
    },
    MEMORY: {
        MIN_TOTAL: 4 * 1024 * 1024 * 1024,    // 4GB
        SWAP_RATIO: 1.5,
        PAGE_SIZE: 4096,                       // bytes
        BUFFER_SIZE: 8192                      // bytes
    },
    DISK: {
        MIN_SPACE: 20 * 1024 * 1024 * 1024,   // 20GB
        BLOCK_SIZE: 4096,                      // bytes
        IO_QUEUE_SIZE: 128,
        FILESYSTEMS: ['ext4', 'xfs', 'btrfs', 'zfs'] as const
    },
    NETWORK: {
        MIN_BANDWIDTH: 100,                    // Mbps
        MAX_CONNECTIONS: 1000,
        BUFFER_SIZES: {
            SEND: 16384,                       // bytes
            RECEIVE: 87380                     // bytes
        }
    }
} as const;

export const SYSTEM_LIMITS = {
    PROCESSES: {
        MAX_PER_USER: 4096,
        NICE_MIN: -20,
        NICE_MAX: 19,
        PRIORITY_LEVELS: ['low', 'normal', 'high', 'realtime'] as const
    },
    FILES: {
        MAX_OPEN: 65535,
        MAX_WATCH: 524288,
        PATH_MAX: 4096
    },
    MEMORY: {
        MAX_MAP_COUNT: 262144,
        MIN_FREE_KBYTES: 67584,
        OVERCOMMIT_RATIO: 50
    }
} as const;

export const SYSTEM_PATHS = {
    RUNTIME: {
        TEMP: '/tmp',
        CACHE: '/var/cache',
        LOGS: '/var/log',
        METRICS: '/var/metrics'
    },
    CONFIG: {
        SYSTEM: '/etc/sysctl.conf',
        SECURITY: '/etc/security/limits.conf',
        NETWORK: '/etc/network'
    }
} as const;

export const SYSTEM_STATES = {
    OPERATIONAL: 'operational',
    DEGRADED: 'degraded',
    MAINTENANCE: 'maintenance',
    ERROR: 'error'
} as const;