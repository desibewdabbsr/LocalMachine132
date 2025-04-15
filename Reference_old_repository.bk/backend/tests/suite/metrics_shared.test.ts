import { 
    SystemMetrics, 
    CPUMetrics, 
    MemoryMetrics, 
    DiskMetrics, 
    NetworkMetrics 
} from '../../shared/types/metrics_shared';

describe('Metrics Type Definitions', () => {
    describe('CPUMetrics', () => {
        const validCPUMetrics: CPUMetrics = {
            cpu_percent: 45.5,
            cpu_count: 8,
            cpu_count_physical: 4,
            per_cpu_percent: [40.5, 42.3, 44.1, 46.2],
            cpu_freq: {
                current: 2400,
                min: 800,
                max: 3200
            },
            timestamp: Date.now()
        };

        it('validates complete CPU metrics structure', () => {
            const metrics: CPUMetrics = validCPUMetrics;
            expect(metrics.cpu_percent).toBeDefined();
            expect(typeof metrics.cpu_percent).toBe('number');
            expect(Array.isArray(metrics.per_cpu_percent)).toBeTruthy();
        });
    });

    describe('MemoryMetrics', () => {
        const validMemoryMetrics: MemoryMetrics = {
            total: 16000000000,
            available: 8000000000,
            used: 8000000000,
            free: 8000000000,
            percent: 50,
            swap: {
                total: 8000000000,
                used: 1000000000,
                free: 7000000000,
                percent: 12.5
            },
            timestamp: Date.now()
        };

        it('validates complete memory metrics structure', () => {
            const metrics: MemoryMetrics = validMemoryMetrics;
            expect(metrics.total).toBeGreaterThan(0);
            expect(metrics.percent).toBeLessThanOrEqual(100);
            expect(metrics.swap?.percent).toBeLessThanOrEqual(100);
        });
    });

    describe('DiskMetrics', () => {
        const validDiskMetrics: DiskMetrics = {
            total: 500000000000,
            used: 250000000000,
            free: 250000000000,
            percent: 50,
            io_counters: {
                read_bytes: 1024000,
                write_bytes: 512000,
                read_count: 1000,
                write_count: 500
            },
            timestamp: Date.now()
        };

        it('validates complete disk metrics structure', () => {
            const metrics: DiskMetrics = validDiskMetrics;
            expect(metrics.total).toBeGreaterThan(metrics.used);
            expect(metrics.io_counters?.read_bytes).toBeDefined();
            expect(metrics.percent).toBeLessThanOrEqual(100);
        });
    });

    describe('NetworkMetrics', () => {
        const validNetworkMetrics: NetworkMetrics = {
            bytes_sent: 1024000,
            bytes_recv: 2048000,
            packets_sent: 1000,
            packets_recv: 2000,
            error_in: 0,
            error_out: 0,
            drop_in: 0,
            drop_out: 0,
            connections: 25,
            connection_stats: {
                'ESTABLISHED': 20,
                'LISTENING': 5
            },
            timestamp: Date.now()
        };

        it('validates complete network metrics structure', () => {
            const metrics: NetworkMetrics = validNetworkMetrics;
            expect(metrics.bytes_sent).toBeDefined();
            expect(metrics.connection_stats?.ESTABLISHED).toBeDefined();
            expect(Object.keys(metrics.connection_stats || {})).toBeTruthy();
        });
    });

    describe('SystemMetrics', () => {
        it('validates complete system metrics integration', () => {
            const metrics: SystemMetrics = {
                cpu: {
                    cpu_percent: 45.5,
                    cpu_count: 8,
                    cpu_count_physical: 4,
                    per_cpu_percent: [40.5, 42.3, 44.1, 46.2],
                    timestamp: Date.now()
                },
                memory: {
                    total: 16000000000,
                    available: 8000000000,
                    used: 8000000000,
                    free: 8000000000,
                    percent: 50,
                    timestamp: Date.now()
                },
                disk: {
                    total: 500000000000,
                    used: 250000000000,
                    free: 250000000000,
                    percent: 50,
                    timestamp: Date.now()
                },
                network: {
                    bytes_sent: 1024000,
                    bytes_recv: 2048000,
                    packets_sent: 1000,
                    packets_recv: 2000,
                    error_in: 0,
                    error_out: 0,
                    drop_in: 0,
                    drop_out: 0,
                    timestamp: Date.now()
                },
                timestamp: Date.now()
            };

            expect(metrics.cpu).toBeDefined();
            expect(metrics.memory).toBeDefined();
            expect(metrics.disk).toBeDefined();
            expect(metrics.network).toBeDefined();
            expect(metrics.timestamp).toBeDefined();
        });
    });
});