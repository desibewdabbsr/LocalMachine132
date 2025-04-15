import { SystemAlert, AlertDetails, AlertConfig } from '../interfaces/IAlert';
import { SystemMetrics } from '../interfaces/IMetrics';
import { BASE_PATHS } from '../../../../config/base/paths';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

export class AlertService {
    private readonly alertsPath: string;
    private readonly metricsPath: string;
    private isMonitoring: boolean = false;

    constructor(private config: AlertConfig) {
        this.alertsPath = path.join(BASE_PATHS.RUNTIME.METRICS, 'alerts');
        this.metricsPath = path.join(BASE_PATHS.RUNTIME.METRICS, 'system');
        this.initialize();
    }

    private async initialize(): Promise<void> {
        await fs.mkdir(this.alertsPath, { recursive: true });
    }

    public async startMonitoring(): Promise<void> {
        this.isMonitoring = true;
        while (this.isMonitoring) {
            try {
                const metrics = await this.getLatestMetrics();
                const alerts = await this.checkMetrics(metrics);
                for (const alert of alerts) {
                    await this.storeAlert(alert);
                }
            } catch (error) {
                console.error('Error in monitoring cycle:', error);
            }
            await new Promise(resolve => setTimeout(resolve, this.config.checkInterval * 1000));
        }
    }

    public stopMonitoring(): void {
        this.isMonitoring = false;
    }

    private async getLatestMetrics(): Promise<SystemMetrics> {
        const files = await fs.readdir(this.metricsPath);
        const metricsFiles = files.filter(f => f.startsWith('metrics_')).sort();
        
        if (metricsFiles.length === 0) {
            throw new Error('No metrics files found');
        }

        const latestFile = path.join(this.metricsPath, metricsFiles[metricsFiles.length - 1]);
        const content = await fs.readFile(latestFile, 'utf-8');
        return JSON.parse(content);
    }

    private async checkMetrics(metrics: SystemMetrics): Promise<SystemAlert[]> {
        const alerts: SystemAlert[] = [];

        if (metrics.cpu.cpu_percent > this.config.thresholds.cpu_usage) {
            alerts.push(await this.createAlert({
                message: `High CPU Usage: ${metrics.cpu.cpu_percent.toFixed(1)}%`,
                severity: metrics.cpu.cpu_percent > 90 ? 'critical' : 'warning',
                source: 'CPU Monitor',
                details: {
                    metric: 'cpu_usage',
                    threshold: this.config.thresholds.cpu_usage,
                    currentValue: metrics.cpu.cpu_percent
                }
            }));
        }

        if (metrics.memory.percent > this.config.thresholds.memory_usage) {
            alerts.push(await this.createAlert({
                message: `High Memory Usage: ${metrics.memory.percent.toFixed(1)}%`,
                severity: metrics.memory.percent > 95 ? 'critical' : 'warning',
                source: 'Memory Monitor',
                details: {
                    metric: 'memory_usage',
                    threshold: this.config.thresholds.memory_usage,
                    currentValue: metrics.memory.percent
                }
            }));
        }

        return alerts;
    }

    private async createAlert(params: Omit<SystemAlert, 'id' | 'timestamp'>): Promise<SystemAlert> {
        return {
            id: uuidv4(),
            timestamp: Date.now(),
            ...params
        };
    }

    public async storeAlert(alert: SystemAlert): Promise<void> {
        const alertPath = path.join(this.alertsPath, `alert_${alert.id}.json`);
        await fs.writeFile(alertPath, JSON.stringify(alert, null, 2));
    }

    public async getRecentAlerts(hours: number = 24): Promise<SystemAlert[]> {
        const files = await fs.readdir(this.alertsPath);
        const alerts: SystemAlert[] = [];
        const cutoff = Date.now() - (hours * 60 * 60 * 1000);

        for (const file of files) {
            if (!file.startsWith('alert_')) continue;
            const content = await fs.readFile(path.join(this.alertsPath, file), 'utf-8');
            const alert: SystemAlert = JSON.parse(content);
            if (alert.timestamp >= cutoff) {
                alerts.push(alert);
            }
        }

        return alerts.sort((a, b) => b.timestamp - a.timestamp);
    }
}