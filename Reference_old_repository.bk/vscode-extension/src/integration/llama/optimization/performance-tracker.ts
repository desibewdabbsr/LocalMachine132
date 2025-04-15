import { EnhancedLogger } from '../../../utils/logger';
import type { PerformanceMetrics, TrackingConfig, OperationResult } from '../types';

export class PerformanceTracker {
    private static readonly METRICS_RETENTION = 1000;
    private static readonly MEMORY_THRESHOLD = 0.9; // 90% memory usage warning
    private readonly logger: EnhancedLogger;
    private metrics: Map<string, PerformanceMetrics[]>;
    private startTimes: Map<string, number>;
    private activeOperations: Set<string>;

    constructor() {
        this.logger = EnhancedLogger.getInstance();
        this.metrics = new Map();
        this.startTimes = new Map();
        this.activeOperations = new Set();
    }

    public async trackOperation<T>(
        operationId: string, 
        operation: () => Promise<T>, 
        config?: TrackingConfig
    ): Promise<OperationResult<T>> {
        if (this.activeOperations.has(operationId)) {
            throw new Error(`Operation ${operationId} is already being tracked`);
        }

        this.activeOperations.add(operationId);
        this.startTracking(operationId);

        try {
            const startMemory = process.memoryUsage();
            const result = await operation();
            const metrics = this.recordMetrics(operationId, startMemory, config);

            return {
                result,
                metrics,
                success: true
            };
        } catch (error) {
            this.logError(operationId, error);
            if (error instanceof Error) {
                throw new Error(`Operation failed: ${error.message}`);
            }
            throw new Error('Operation failed: Unknown error');
        } finally {
            this.activeOperations.delete(operationId);
            this.checkMemoryUsage();
        }
    }

    private logError(operationId: string, error: unknown): void {
        this.logger.error(JSON.stringify({
            message: 'Performance tracking failed',
            operationId,
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
        }));
    }




    public clearMetrics(operationId: string): void {
        // First check if metrics exist before clearing
        const hasMetrics = this.metrics.has(operationId);
        
        if (hasMetrics) {
            this.metrics.delete(operationId);
            this.startTimes.delete(operationId);
            this.logger.debug(JSON.stringify({
                message: 'Metrics cleared successfully',
                operationId
            }));
        } else {
            this.logger.warn(JSON.stringify({
                message: 'Attempting to clear non-existent metrics',
                operationId
            }));
        }
    }
    

    public getMetrics(operationId: string): PerformanceMetrics[] {
        const metrics = this.metrics.get(operationId);
        // Return empty array without warning if metrics don't exist after clearing
        return metrics ? [...metrics] : [];
    }

    public getActiveOperations(): string[] {
        return Array.from(this.activeOperations);
    }

    private startTracking(operationId: string): void {
        this.startTimes.set(operationId, performance.now());
        this.logger.debug(JSON.stringify({
            message: 'Started performance tracking',
            operationId,
            timestamp: new Date().toISOString()
        }));
    }

    private recordMetrics(
        operationId: string, 
        startMemory: NodeJS.MemoryUsage,
        config?: TrackingConfig
    ): PerformanceMetrics {
        const startTime = this.startTimes.get(operationId);
        if (!startTime) {
            throw new Error(`No start time found for operation: ${operationId}`);
        }

        const endMemory = process.memoryUsage();
        const metrics: PerformanceMetrics = {
            duration: performance.now() - startTime,
            memoryUsage: {
                heapUsed: endMemory.heapUsed - startMemory.heapUsed,
                heapTotal: endMemory.heapTotal,
                external: endMemory.external,
                rss: endMemory.rss
            },
            timestamp: Date.now(),
            operationId,
            config
        };

        this.updateMetricsStore(operationId, metrics);
        this.logPerformanceData(operationId, metrics);
        return metrics;
    }

    private checkMemoryUsage(): void {
        const memUsage = process.memoryUsage();
        const heapUsageRatio = memUsage.heapUsed / memUsage.heapTotal;

        if (heapUsageRatio > PerformanceTracker.MEMORY_THRESHOLD) {
            this.logger.warn(JSON.stringify({
                message: 'High memory usage detected',
                heapUsageRatio,
                memoryUsage: memUsage
            }));
        }
    }

    private updateMetricsStore(operationId: string, metrics: PerformanceMetrics): void {
        const history = this.metrics.get(operationId) || [];
        history.push(metrics);

        if (history.length > PerformanceTracker.METRICS_RETENTION) {
            history.shift();
        }

        this.metrics.set(operationId, history);
    }

    private logPerformanceData(operationId: string, metrics: PerformanceMetrics): void {
        this.logger.debug(JSON.stringify({
            message: 'Performance metrics recorded',
            operationId,
            metrics
        }));
    }
}

// npm run test -- tests/suite/llama/performance-tracker.test.ts