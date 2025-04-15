import {
    MonitoringConfig,
    CollectionConfig,
    StorageConfig,
    AnalysisConfig,
    ReportingConfig,
    MonitoringMetrics,
    MonitoringStatus
} from '../../shared/types/monitoring_shared';

describe('Monitoring Type Definitions', () => {
    describe('CollectionConfig', () => {
        const config: CollectionConfig = {
            interval: 60,
            batchSize: 100,
            metrics: {
                system: true,
                process: true,
                network: true,
                custom: false
            },
            priority: 'high'
        };

        it('validates collection configuration', () => {
            expect(config.interval).toBeGreaterThan(0);
            expect(config.batchSize).toBeGreaterThan(0);
            expect(['realtime', 'high', 'normal', 'low']).toContain(config.priority);
        });
    });

    describe('StorageConfig', () => {
        const config: StorageConfig = {
            path: '/metrics/storage',
            format: 'json',
            retention: {
                days: 30,
                maxSize: 1024 * 1024 * 1024
            },
            compression: {
                enabled: true,
                level: 6
            }
        };

        it('validates storage configuration', () => {
            expect(['json', 'binary', 'compressed']).toContain(config.format);
            expect(config.retention.days).toBeGreaterThan(0);
            expect(config.compression.level).toBeLessThanOrEqual(9);
        });
    });

    describe('AnalysisConfig', () => {
        const config: AnalysisConfig = {
            enabled: true,
            methods: ['trending', 'anomaly', 'threshold'],
            windows: {
                short: 300,
                medium: 3600,
                long: 86400
            },
            sensitivity: 0.8
        };

        it('validates analysis configuration', () => {
            expect(config.methods.length).toBeGreaterThan(0);
            expect(config.windows.long).toBeGreaterThan(config.windows.medium);
            expect(config.sensitivity).toBeLessThanOrEqual(1);
        });
    });

    describe('ReportingConfig', () => {
        const config: ReportingConfig = {
            enabled: true,
            formats: ['json', 'html'],
            schedule: {
                frequency: 'daily',
                time: '00:00'
            },
            destinations: ['file', 'email']
        };

        it('validates reporting configuration', () => {
            expect(config.formats.length).toBeGreaterThan(0);
            expect(['hourly', 'daily', 'weekly']).toContain(config.schedule.frequency);
            expect(config.destinations.length).toBeGreaterThan(0);
        });
    });

    describe('MonitoringMetrics', () => {
        const metrics: MonitoringMetrics = {
            id: 'metric-123',
            timestamp: Date.now(),
            type: 'system',
            values: {
                cpu_usage: 45.5,
                memory_used: 8589934592
            },
            metadata: {
                source: 'system_monitor',
                tags: ['production', 'critical'],
                priority: 1
            }
        };

        it('validates monitoring metrics structure', () => {
            expect(metrics.id).toBeDefined();
            expect(metrics.timestamp).toBeLessThanOrEqual(Date.now());
            expect(['system', 'process', 'network', 'custom']).toContain(metrics.type);
            expect(Object.keys(metrics.values).length).toBeGreaterThan(0);
        });
    });

    describe('MonitoringStatus', () => {
        const status: MonitoringStatus = {
            active: true,
            lastCheck: Date.now(),
            healthScore: 0.95,
            metrics: {
                collected: 1000,
                processed: 950,
                stored: 950,
                errors: 50
            }
        };

        it('validates monitoring status structure', () => {
            expect(status.healthScore).toBeGreaterThanOrEqual(0);
            expect(status.healthScore).toBeLessThanOrEqual(1);
            expect(status.metrics.collected).toBeGreaterThanOrEqual(status.metrics.processed);
            expect(status.lastCheck).toBeLessThanOrEqual(Date.now());
        });
    });

    describe('Complete MonitoringConfig', () => {
        const config: MonitoringConfig = {
            collection: {
                interval: 60,
                batchSize: 100,
                metrics: {
                    system: true,
                    process: true,
                    network: true,
                    custom: false
                },
                priority: 'high'
            },
            storage: {
                path: '/metrics/storage',
                format: 'json',
                retention: {
                    days: 30,
                    maxSize: 1024 * 1024 * 1024
                },
                compression: {
                    enabled: true,
                    level: 6
                }
            },
            analysis: {
                enabled: true,
                methods: ['trending', 'anomaly', 'threshold'],
                windows: {
                    short: 300,
                    medium: 3600,
                    long: 86400
                },
                sensitivity: 0.8
            },
            reporting: {
                enabled: true,
                formats: ['json', 'html'],
                schedule: {
                    frequency: 'daily',
                    time: '00:00'
                },
                destinations: ['file', 'email']
            }
        };

        it('validates complete monitoring configuration', () => {
            expect(config.collection).toBeDefined();
            expect(config.storage).toBeDefined();
            expect(config.analysis).toBeDefined();
            expect(config.reporting).toBeDefined();
        });
    });
});