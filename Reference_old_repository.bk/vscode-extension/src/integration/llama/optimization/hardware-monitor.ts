import { EnhancedLogger } from '../../../utils/logger';
import type { HardwareMetrics, MonitoringConfig, ResourceUsage } from '../types';
import { cpus } from 'os';

interface CPUTimes {
    user: number;
    nice: number;
    sys: number;
    idle: number;
    irq: number;
}

export class HardwareMonitor {
    private static readonly MONITORING_INTERVAL = 1000;
    private static readonly CPU_THRESHOLD = 0.8;
    private static readonly MEMORY_THRESHOLD = 0.85;
    private static readonly METRICS_RETENTION = 3600;

    private readonly logger: EnhancedLogger;
    private metrics: Map<string, HardwareMetrics[]>;
    private monitoringInterval?: NodeJS.Timeout;
    private isMonitoring: boolean;

    constructor() {
        this.logger = EnhancedLogger.getInstance();
        this.metrics = new Map();
        this.isMonitoring = false;
    }

    public startMonitoring(config?: MonitoringConfig): void {
        if (this.isMonitoring) {
            throw new Error('Hardware monitoring is already active');
        }

        this.isMonitoring = true;
        this.logger.info(JSON.stringify({
            message: 'Starting hardware monitoring',
            config
        }));

        this.monitoringInterval = setInterval(() => {
            this.collectMetrics(config);
        }, HardwareMonitor.MONITORING_INTERVAL);
    }




    public stopMonitoring(): void {
        if (!this.isMonitoring) {
            this.logger.warn('Attempting to stop inactive monitoring');
            return;
        }

        clearInterval(this.monitoringInterval);
        this.isMonitoring = false;
        this.logger.info('Hardware monitoring stopped');
    }

    public getMetrics(timeRange?: { start: number; end: number }): HardwareMetrics[] {
        const allMetrics: HardwareMetrics[] = [];
        this.metrics.forEach(metricSet => allMetrics.push(...metricSet));

        if (timeRange) {
            return allMetrics.filter(metric => 
                metric.timestamp >= timeRange.start && 
                metric.timestamp <= timeRange.end
            );
        }

        return allMetrics;
    }

    public getCurrentUsage(): ResourceUsage {
        const usage = this.collectResourceUsage();
        this.checkThresholds(usage);
        return usage;
    }

    private collectMetrics(config?: MonitoringConfig): void {
        try {
            const usage = this.collectResourceUsage();
            const metrics: HardwareMetrics = {
                ...usage,
                timestamp: Date.now(),
                config
            };
    
            this.storeMetrics('system', metrics);
            this.checkThresholds(usage);
        } catch (error) {
            this.logger.error(JSON.stringify({
                message: 'Metrics collection failed',
                error: error instanceof Error ? error.message : 'Unknown error'
            }));
        }
    }
    



    private getCPUUsage(): number {
    const processorInfo = cpus();
    const totalUsage = processorInfo.reduce((acc: number, cpu) => {
        const times = cpu.times as CPUTimes;
        const total = Object.values(times).reduce((sum: number, value: number) => sum + value, 0);
        return acc + (1 - times.idle / total);
    }, 0);
    
    return totalUsage / processorInfo.length;
    }


    private collectResourceUsage(): ResourceUsage {
        const memUsage = process.memoryUsage();
        
        return {
            cpuUsage: this.getCPUUsage(),
            memoryUsage: {
                heapUsed: memUsage.heapUsed,
                heapTotal: memUsage.heapTotal,
                external: memUsage.external,
                rss: memUsage.rss
            },
            threadCount: this.getThreadCount()
        };
    }



    private getThreadCount(): number {
        return require('os').cpus().length;
    }

    private storeMetrics(category: string, metrics: HardwareMetrics): void {
        const categoryMetrics = this.metrics.get(category) || [];
        categoryMetrics.push(metrics);

        // Maintain retention limit
        while (categoryMetrics.length > HardwareMonitor.METRICS_RETENTION) {
            categoryMetrics.shift();
        }

        this.metrics.set(category, categoryMetrics);
    }

    private checkThresholds(usage: ResourceUsage): void {
        if (usage.cpuUsage > HardwareMonitor.CPU_THRESHOLD) {
            this.logger.warn(JSON.stringify({
                message: 'High CPU usage detected',
                usage: usage.cpuUsage
            }));
        }

        const memoryUsageRatio = usage.memoryUsage.heapUsed / usage.memoryUsage.heapTotal;
        if (memoryUsageRatio > HardwareMonitor.MEMORY_THRESHOLD) {
            this.logger.warn(JSON.stringify({
                message: 'High memory usage detected',
                usage: memoryUsageRatio
            }));
        }
    }

    private handleError(message: string, error: unknown): void {
        this.logger.error(JSON.stringify({
            message,
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
        }));
    }
}





// npm run test -- tests/suite/llama/hardware-monitor.test.ts