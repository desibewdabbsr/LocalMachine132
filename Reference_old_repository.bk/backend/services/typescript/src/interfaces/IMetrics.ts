export interface SystemMetrics {
    cpu: {
        cpu_percent: number;
        cpu_count: number;
        cpu_freq: {
            current?: number;
            min?: number;
            max?: number;
        };
        per_cpu_percent?: number[];
    };
    memory: {
        total: number;
        available: number;
        used: number;
        free: number;
        percent: number;
        swap?: {
            total: number;
            used: number;
            free: number;
            percent: number;
        };
    };
    disk: {
        total: number;
        used: number;
        free: number;
        percent: number;
        io_counters?: {
            read_bytes: number;
            write_bytes: number;
            read_count: number;
            write_count: number;
        };
    };
    network: {
        bytes_sent: number;
        bytes_recv: number;
        packets_sent: number;
        packets_recv: number;
        error_in?: number;
        error_out?: number;
        drop_in?: number;
        drop_out?: number;
    };
    timestamp: number;
}