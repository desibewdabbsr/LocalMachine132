import { BASE_PATHS } from '../../../../config/base/paths';
import { STORAGE_CONFIG } from '../../../../config/base/storage';
import { SystemMetrics, HardwareMetrics } from '..../../../types';
import { join } from 'path';
import fs from 'fs/promises';

export class MetricsService {
    private readonly metricsPath: string;
    private readonly retentionPeriod: number;

    constructor() {
        this.metricsPath = join(BASE_PATHS.RUNTIME.METRICS, 'processed');
        this.retentionPeriod = STORAGE_CONFIG.metrics.retentionPeriod;
    }

    async collectSystemMetrics(): Promise<SystemMetrics> {
        try {
            const metricsFiles = await fs.readdir(this.metricsPath);
            const latestMetrics = metricsFiles
                .filter(file => file.startsWith('metrics_'))
                .sort()
                .pop();

            if (!latestMetrics) {
                throw new Error('No metrics data available');
            }

            const metricsData = await fs.readFile(
                join(this.metricsPath, latestMetrics),
                'utf-8'
            );
            return JSON.parse(metricsData);
        } catch (error) {
            throw new Error(`Failed to collect system metrics: ${error}`);
        }
    }

    async processHardwareMetrics(metrics: HardwareMetrics): Promise<void> {
        try {
            const timestamp = Date.now();
            const filename = `hardware_${timestamp}.json`;
            const filepath = join(this.metricsPath, filename);

            await fs.writeFile(filepath, JSON.stringify(metrics, null, 2));
            await this.cleanupOldMetrics();
        } catch (error) {
            throw new Error(`Failed to process hardware metrics: ${error}`);
        }
    }
    
    private async cleanupOldMetrics(): Promise<void> {
        try {
            const files = await fs.readdir(this.metricsPath);
            const currentTime = Date.now();
    
            for (const file of files) {
                if (file.startsWith('hardware_')) {
                    const timestamp = parseInt(file.split('_')[1]);
                    if (currentTime - timestamp > this.retentionPeriod * 3600 * 1000) {
                        await fs.unlink(join(this.metricsPath, file));
                    }
                }
            }
        } catch (error) {
            throw new Error(`Failed to cleanup old metrics: ${error}`);
        }
    }
    
}