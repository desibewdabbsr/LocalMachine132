export interface SystemMetrics {
    cpu: CPUMetrics;
    memory: MemoryMetrics;
    disk: DiskMetrics;
    network: NetworkMetrics;
    timestamp: number;
}

export interface CPUMetrics {
    cpu_percent: number;
    cpu_count: number;
    cpu_count_physical: number;
    per_cpu_percent: number[];
    cpu_freq?: {
        current: number;
        min: number;
        max: number;
    };
    timestamp: number;
}

export interface MemoryMetrics {
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
    timestamp: number;
}

export interface DiskMetrics {
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
    timestamp: number;
}

export interface NetworkMetrics {
    bytes_sent: number;
    bytes_recv: number;
    packets_sent: number;
    packets_recv: number;
    error_in: number;
    error_out: number;
    drop_in: number;
    drop_out: number;
    connections?: number;
    connection_stats?: Record<string, number>;
    timestamp: number;
}