


import { MetricsService } from '../../services/typescript/src/services/MetricsService';
import { SystemMetrics, HardwareMetrics } from '../../types';
import fs from 'fs/promises';
import { join } from 'path';
import { BASE_PATHS } from '../../config/base/paths';

describe('MetricsService Integration Tests', () => {
    let metricsService: MetricsService;
    const testMetricsPath = join(BASE_PATHS.RUNTIME.METRICS, 'processed');

    beforeAll(async () => {
        await fs.mkdir(testMetricsPath, { recursive: true });
        metricsService = new MetricsService();
    });

    afterAll(async () => {
        const files = await fs.readdir(testMetricsPath);
        await Promise.all(
            files.map(file => fs.unlink(join(testMetricsPath, file)))
        );
    });

    test('collects system metrics from actual files', async () => {
        const testMetrics: SystemMetrics = {
            cpu: {
                usage: 45.5,
                temperature: 65,
                threads: 8
            },
            memory: {
                total: 16000000000,
                used: 8000000000,
                free: 8000000000
            },
            timestamp: Date.now()
        };

        await fs.writeFile(
            join(testMetricsPath, `metrics_${Date.now()}.json`),
            JSON.stringify(testMetrics)
        );

        const metrics = await metricsService.collectSystemMetrics();
        expect(metrics).toBeDefined();
        expect(metrics.cpu).toBeDefined();
        expect(metrics.memory).toBeDefined();
        expect(metrics.timestamp).toBeDefined();
    });

    test('processes and stores hardware metrics', async () => {
        const hardwareMetrics: HardwareMetrics = {
            gpu: {
                usage: 75.5,
                memory: 4000000000,
                temperature: 70
            },
            network: {
                bytesReceived: 1000000,
                bytesSent: 500000
            },
            timestamp: Date.now()
        };

        await metricsService.processHardwareMetrics(hardwareMetrics);
        
        const files = await fs.readdir(testMetricsPath);
        const hardwareFiles = files.filter(f => f.startsWith('hardware_'));
        expect(hardwareFiles.length).toBeGreaterThan(0);

        const latestFile = hardwareFiles.sort().pop();
        const storedMetrics = JSON.parse(
            await fs.readFile(join(testMetricsPath, latestFile!), 'utf-8')
        );

        expect(storedMetrics).toMatchObject(hardwareMetrics);
    });

    test('cleans up old metrics based on retention period', async () => {
        const oldTimestamp = Date.now() - (25 * 3600 * 1000);
        const oldMetrics: HardwareMetrics = {
            gpu: { usage: 0, memory: 0, temperature: 0 },
            network: { bytesReceived: 0, bytesSent: 0 },
            timestamp: oldTimestamp
        };

        const oldFilePath = join(testMetricsPath, `hardware_${oldTimestamp}.json`);
        await fs.writeFile(oldFilePath, JSON.stringify(oldMetrics));

        await new Promise(resolve => setTimeout(resolve, 100));

        await metricsService.processHardwareMetrics({
            gpu: { usage: 50, memory: 2000000000, temperature: 65 },
            network: { bytesReceived: 500000, bytesSent: 250000 },
            timestamp: Date.now()
        });

        const files = await fs.readdir(testMetricsPath);
        expect(files.includes(`hardware_${oldTimestamp}.json`)).toBeFalsy();
    });
});