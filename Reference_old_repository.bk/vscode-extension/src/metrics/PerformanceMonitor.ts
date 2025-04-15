import { HardwareConfig } from '../../tests/types';
import { EnhancedLogger } from '../utils/logger';



export interface PerformanceMetrics {
    cpuUsage: number;
    memoryUsage: number;
    threadUtilization: number;
    gpuUtilization?: number;
    vramUsage?: number;
    timestamp: number;
}

export class PerformanceMonitor {
    private metricsHistory: PerformanceMetrics[] = [];
    private collectionInterval: NodeJS.Timeout | null = null;

    constructor(
        private config: HardwareConfig,
        private logger: EnhancedLogger
    ) {
        this.startMetricsCollection();
    }

    public collectMetrics(): PerformanceMetrics {
        const baseMetrics = {
            cpuUsage: this.measureCPUUsage(),
            memoryUsage: this.measureMemoryUsage(),
            threadUtilization: this.calculateThreadUtilization(),
            timestamp: Date.now()
        };

        if (this.config.device === 'cuda') {
            return {
                ...baseMetrics,
                gpuUtilization: this.measureGPUUtilization(),
                vramUsage: this.measureVRAMUsage()
            };
        }

        return baseMetrics;
    }

    private measureCPUUsage(): number {
        const usage = process.cpuUsage();
        return (usage.user + usage.system) / 1000000;
    }

    private measureMemoryUsage(): number {
        const usage = process.memoryUsage();
        return (usage.heapUsed / usage.heapTotal) * 100;
    }

    private calculateThreadUtilization(): number {
        return (this.config.threads / navigator.hardwareConcurrency) * 100;
    }

    private measureGPUUtilization(): number {
        return Math.random() * 100; // Placeholder for actual GPU metrics
    }

    private measureVRAMUsage(): number {
        return (this.config.memoryLimit / 16384) * 100;
    }

    private startMetricsCollection() {
        this.collectionInterval = setInterval(() => {
            const metrics = this.collectMetrics();
            this.metricsHistory.push(metrics);
            this.logger.info(`Metrics collected: ${JSON.stringify(metrics)}`);
        }, 1000);
    }

    public async getPerformanceHistory(): Promise<PerformanceMetrics[]> {
        return this.metricsHistory;
    }

    public cleanup() {
        if (this.collectionInterval) {
            clearInterval(this.collectionInterval);
            this.collectionInterval = null;
        }
    }
}

// npm run test -- tests/suite/PerformanceMonitor.test.ts