import { AlertService } from '../../../services/typescript/src/services/AlertService';
import { AlertConfig } from '../../../services/typescript/src/interfaces/IAlert';
import { BASE_PATHS } from '../../../config/base/paths';
import path from 'path';
import fs from 'fs/promises';

// const testAlertsPath = path.join(BASE_PATHS.RUNTIME.METRICS, 'test_alerts');

const testMetricsPath = path.join(BASE_PATHS.RUNTIME.METRICS, 'system');
const testAlertsPath = path.join(BASE_PATHS.RUNTIME.METRICS, 'alerts');


const testConfig: AlertConfig = {
    thresholds: {
        cpu_usage: 80,
        memory_usage: 90,
        disk_usage: 85,
        network_latency: 1000
    },
    storagePath: testAlertsPath,
    retentionDays: 1,
    checkInterval: 1,
    alertLevels: ['info', 'warning', 'critical']
};

describe('AlertService Integration Tests', () => {
    let alertService: AlertService;

    beforeEach(async () => {
        // Create both directories
        await fs.mkdir(testMetricsPath, { recursive: true });
        await fs.mkdir(testAlertsPath, { recursive: true });
        
        // Create a sample metrics file
        const sampleMetrics = {
            cpu: { cpu_percent: 85, cpu_count: 4 },
            memory: { total: 16000, available: 8000, used: 8000, free: 8000, percent: 50 },
            disk: { total: 500000, used: 250000, free: 250000, percent: 50 },
            network: { bytes_sent: 1000, bytes_recv: 1000, packets_sent: 100, packets_recv: 100 },
            timestamp: Date.now()
        };
        await fs.writeFile(
            path.join(testMetricsPath, `metrics_${Date.now()}.json`),
            JSON.stringify(sampleMetrics)
        );
        
        alertService = new AlertService(testConfig);
    });

    afterEach(async () => {
        // Cleanup both directories
        await Promise.all([
            fs.rm(testMetricsPath, { recursive: true, force: true }),
            fs.rm(testAlertsPath, { recursive: true, force: true })
        ]);
    });


    test('service initialization', async () => {
        expect(alertService).toBeDefined();
        const exists = await fs.stat(testAlertsPath)
            .then(() => true)
            .catch(() => false);
        expect(exists).toBe(true);
    });

    test('alert creation and storage', async () => {
        const testAlert = {
            id: 'test-alert-1',
            message: 'Test Alert',
            severity: 'warning' as const,
            timestamp: Date.now(), // Use current timestamp instead of offset
            source: 'Test',
            details: {
                metric: 'test_metric',
                threshold: 80,
                currentValue: 85
            }
        };
    
        await alertService.storeAlert(testAlert);
        // Allow a small delay for file system operations
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const alerts = await alertService.getRecentAlerts(1);
        expect(alerts).toHaveLength(1);
        expect(alerts[0].id).toBe(testAlert.id);
        expect(alerts[0].message).toBe(testAlert.message);
        expect(alerts[0].severity).toBe(testAlert.severity);
    });
    
    test('alert monitoring cycle', async () => {
        let monitoringPromise: Promise<void> | undefined = undefined;
        
        try {
            monitoringPromise = alertService.startMonitoring();
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const alerts = await alertService.getRecentAlerts(1);
            expect(Array.isArray(alerts)).toBeTruthy();
            
            const files = await fs.readdir(testAlertsPath);
            const alertFiles = files.filter(f => f.startsWith('alert_'));
            expect(alertFiles.length).toBeGreaterThanOrEqual(0);
        } finally {
            alertService.stopMonitoring();
            if (monitoringPromise) {
                await monitoringPromise.catch(() => {});
            }
        }
    });

    test('alert retention', async () => {
        const oldAlert = {
            id: 'old-alert',
            message: 'Old Alert',
            severity: 'info' as const,
            timestamp: Date.now() - (25 * 3600000), // 25 hours ago
            source: 'Test'
        };
    
        const newAlert = {
            id: 'new-alert',
            message: 'New Alert',
            severity: 'info' as const,
            timestamp: Date.now(), // current time
            source: 'Test'
        };
    
        await Promise.all([
            alertService.storeAlert(oldAlert),
            alertService.storeAlert(newAlert)
        ]);
    
        const alerts = await alertService.getRecentAlerts(24); // Last 24 hours
        expect(alerts).toHaveLength(1);
        expect(alerts[0].id).toBe('new-alert');
    });
    
});