import * as vscode from 'vscode';
import { PerformanceMetric, MetricCategory } from '../../tests/types';
import { EnhancedLogger } from '../utils/logger';

export class MetricsService {
    private metrics: Map<string, MetricCategory> = new Map();
    private logger: EnhancedLogger;

    constructor(private readonly context: vscode.ExtensionContext) {
        this.logger = EnhancedLogger.getInstance();
    }

    public trackOperation(category: string, operation: string): PerformanceMetric {
        const metric: PerformanceMetric = {
            startTime: performance.now(),
            endTime: 0,
            duration: 0,
            success: false
        };

        if (!this.metrics.has(category)) {
            this.metrics.set(category, {});
        }

        const categoryMetrics = this.metrics.get(category)!;
        categoryMetrics[operation] = metric;

        return metric;
    }

    public completeOperation(category: string, operation: string, success: boolean): void {
        const metric = this.metrics.get(category)?.[operation];
        if (metric) {
            metric.endTime = performance.now();
            metric.duration = metric.endTime - metric.startTime;
            metric.success = success;
            this.logger.info(`Operation ${operation} completed in ${metric.duration}ms`);
        }
    }

    public getMetrics(): Map<string, MetricCategory> {
        return this.metrics;
    }
}


// npm run test:suite -- tests/suite/metrics-services.test.ts