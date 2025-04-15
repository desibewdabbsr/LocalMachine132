import {
    AlertThresholds,
    AlertSeverity,
    AlertMetadata,
    AlertDetails,
    SystemAlert,
    AlertConfig
} from '../../shared/types/alerts_shared';

describe('Alert Type Definitions', () => {
    describe('AlertThresholds', () => {
        const thresholds: AlertThresholds = {
            cpu_usage: 80,
            memory_usage: 90,
            disk_usage: 85,
            network_latency: 1000,
            io_wait: 5,
            swap_usage: 60
        };

        it('validates threshold structure', () => {
            expect(thresholds.cpu_usage).toBeLessThanOrEqual(100);
            expect(thresholds.memory_usage).toBeLessThanOrEqual(100);
            expect(thresholds.disk_usage).toBeLessThanOrEqual(100);
            expect(thresholds.network_latency).toBeGreaterThan(0);
        });
    });

    describe('AlertMetadata', () => {
        const metadata: AlertMetadata = {
            source: 'system_monitor',
            category: 'performance',
            component: 'cpu',
            tags: ['high_usage', 'performance_critical']
        };

        it('validates metadata structure', () => {
            expect(['system', 'performance', 'security', 'resource']).toContain(metadata.category);
            expect(Array.isArray(metadata.tags)).toBeTruthy();
            expect(metadata.tags.length).toBeGreaterThan(0);
        });
    });

    describe('AlertDetails', () => {
        const details: AlertDetails = {
            metric: 'cpu_usage',
            threshold: 80,
            currentValue: 85,
            unit: 'percent',
            trend: 'increasing',
            additionalInfo: {
                process_count: 120,
                top_processes: ['chrome', 'node']
            }
        };

        it('validates alert details structure', () => {
            expect(details.currentValue).toBeGreaterThan(details.threshold);
            expect(['increasing', 'decreasing', 'stable']).toContain(details.trend);
            expect(details.additionalInfo).toBeDefined();
        });
    });

    describe('SystemAlert', () => {
        const alert: SystemAlert = {
            id: 'alert-123',
            message: 'High CPU Usage Detected',
            severity: 'critical',
            timestamp: Date.now(),
            metadata: {
                source: 'system_monitor',
                category: 'performance',
                component: 'cpu',
                tags: ['high_usage']
            },
            details: {
                metric: 'cpu_usage',
                threshold: 80,
                currentValue: 95
            },
            acknowledged: false
        };

        it('validates complete alert structure', () => {
            expect(alert.id).toBeDefined();
            expect(['info', 'warning', 'critical', 'error']).toContain(alert.severity);
            expect(alert.timestamp).toBeLessThanOrEqual(Date.now());
            expect(alert.metadata).toBeDefined();
            expect(alert.details).toBeDefined();
        });
    });

    describe('AlertConfig', () => {
        const config: AlertConfig = {
            thresholds: {
                cpu_usage: 80,
                memory_usage: 90,
                disk_usage: 85,
                network_latency: 1000,
                io_wait: 5,
                swap_usage: 60
            },
            checkInterval: 60,
            retentionPeriod: 7 * 24 * 60 * 60,
            storageConfig: {
                path: '/metrics/alerts',
                format: 'json',
                compression: true
            },
            notificationConfig: {
                enabled: true,
                channels: ['email', 'slack'],
                minSeverity: 'warning'
            }
        };

        it('validates complete config structure', () => {
            expect(config.checkInterval).toBeGreaterThan(0);
            expect(config.retentionPeriod).toBeGreaterThan(0);
            expect(['json', 'binary']).toContain(config.storageConfig.format);
            expect(config.notificationConfig.channels.length).toBeGreaterThan(0);
        });
    });
});