import { EnhancedLogger } from '../../../../utils/logger';
import { PerformanceTracker } from '../../../build/monitoring/performance-tracker';
import { 
    SystemMetrics, 
    ResourceAnalysis, 
    ResourceThresholds,
    ResourceTrend,
    AnalysisResult 
} from '../core/resource-manager-types';

export class ResourceMetricsAnalyzer {
    private readonly logger: EnhancedLogger;
    private readonly performanceTracker: PerformanceTracker;
    private isInitialized: boolean = false;
    private metricsHistory: SystemMetrics[] = [];

    constructor(
        private readonly thresholds: ResourceThresholds,
        private readonly historySize: number = 100,
        private readonly networkUrl: string,
        private readonly networkService: any,
        logger?: EnhancedLogger
    ) {
        this.logger = logger || EnhancedLogger.getInstance();
        this.performanceTracker = new PerformanceTracker(networkUrl, networkService);
    }

    async initialize(): Promise<void> {
        return this.logger.logOperation('metrics-analyzer', 'initialize', async () => {
            try {
                await this.performanceTracker.initialize();
                this.isInitialized = true;
                this.logger.info('Resource metrics analyzer initialized successfully');
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                this.logger.error(`Metrics analyzer initialization failed: ${errorMessage}`);
                throw new Error('Failed to initialize metrics analyzer');
            }
        });
    }

    async analyzeMetrics(currentMetrics: SystemMetrics): Promise<ResourceAnalysis> {
        if (!this.isInitialized) {
            throw new Error('Metrics analyzer not initialized');
        }
    
        const sessionId = await this.performanceTracker.startTracking('metrics-analysis');
        this.updateMetricsHistory(currentMetrics);
    
        // Perform analysis outside of performance tracking
        const memoryAnalysis = this.analyzeMemoryUsage(currentMetrics);
        const cpuAnalysis = this.analyzeCPUUsage(currentMetrics);
        const diskAnalysis = this.analyzeDiskUsage(currentMetrics);
        const trends = this.analyzeTrends();
    
        // Track the operation but return our analysis result
        await this.performanceTracker.trackOperation(sessionId, async () => {
            // Operation being tracked
            return { memory: memoryAnalysis, cpu: cpuAnalysis, disk: diskAnalysis };
        });
    
        // Return the complete analysis
        return {
            memory: memoryAnalysis,
            cpu: cpuAnalysis,
            disk: diskAnalysis,
            trends,
            timestamp: Date.now(),
            recommendations: this.generateRecommendations({
                memory: memoryAnalysis,
                cpu: cpuAnalysis,
                disk: diskAnalysis,
                trends
            })
        };
    }
    

    private updateMetricsHistory(metrics: SystemMetrics): void {
        this.metricsHistory.push(metrics);
        if (this.metricsHistory.length > this.historySize) {
            this.metricsHistory.shift();
        }
    }

    private analyzeMemoryUsage(metrics: SystemMetrics): AnalysisResult {
        const { percentage } = metrics.memory;
        return {
            status: percentage > this.thresholds.memory.critical ? 'critical' :
                    percentage > this.thresholds.memory.warning ? 'warning' : 'healthy',
            value: percentage,
            threshold: this.thresholds.memory.warning,
            details: `Memory usage at ${percentage.toFixed(2)}%`
        };
    }

    private analyzeCPUUsage(metrics: SystemMetrics): AnalysisResult {
        const { usage } = metrics.cpu;
        return {
            status: usage > this.thresholds.cpu.critical ? 'critical' :
                    usage > this.thresholds.cpu.warning ? 'warning' : 'healthy',
            value: usage,
            threshold: this.thresholds.cpu.warning,
            details: `CPU usage at ${usage.toFixed(2)}%`
        };
    }

    // private analyzeDiskUsage(metrics: SystemMetrics): AnalysisResult {
    //     const { percentage } = metrics.disk;
    //     return {
    //         status: percentage > this.thresholds.disk.critical ? 'critical' :
    //                 percentage > this.thresholds.disk.warning ? 'warning' : 'healthy',
    //         value: percentage,
    //         threshold: this.thresholds.disk.warning,
    //         details: `Disk usage at ${percentage.toFixed(2)}%`
    //     };
    // }

    private analyzeDiskUsage(metrics: SystemMetrics): AnalysisResult {
        const { percentage } = metrics.disk;
        return {
            status: this.determineResourceStatus(
                percentage,
                this.thresholds.disk.warning,
                this.thresholds.disk.critical
            ),
            value: percentage,
            threshold: this.thresholds.disk.warning,
            details: `Disk usage at ${percentage.toFixed(2)}%`
        };
    }
    
    private determineResourceStatus(
        value: number,
        warningThreshold: number,
        criticalThreshold: number
    ): 'healthy' | 'warning' | 'critical' {
        if (value >= criticalThreshold) return 'critical';
        if (value >= warningThreshold) return 'warning';
        return 'healthy';
    }
    

    private analyzeTrends(): ResourceTrend {
        if (this.metricsHistory.length < 2) {
            return { memory: 'stable', cpu: 'stable', disk: 'stable' };
        }

        return {
            memory: this.calculateTrend(metric => metric.memory.percentage),
            cpu: this.calculateTrend(metric => metric.cpu.usage),
            disk: this.calculateTrend(metric => metric.disk.percentage)
        };
    }

    private calculateTrend(valueSelector: (metric: SystemMetrics) => number): 'increasing' | 'decreasing' | 'stable' {
        const values = this.metricsHistory.map(valueSelector);
        const trend = this.calculateLinearRegression(values);
        
        if (trend > 0.1) return 'increasing';
        if (trend < -0.1) return 'decreasing';
        return 'stable';
    }

    private calculateLinearRegression(values: number[]): number {
        const n = values.length;
        const x = Array.from({ length: n }, (_, i) => i);
        const y = values;

        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((acc, curr, i) => acc + curr * y[i], 0);
        const sumXX = x.reduce((acc, curr) => acc + curr * curr, 0);

        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        return slope;
    }

    private generateRecommendations(analysis: Omit<ResourceAnalysis, 'timestamp' | 'recommendations'>): string[] {
        const recommendations: string[] = [];

        if (analysis.memory.status === 'critical') {
            recommendations.push('Consider increasing memory allocation or optimizing memory usage');
        }
        if (analysis.cpu.status === 'critical') {
            recommendations.push('Review CPU-intensive operations and consider optimization');
        }
        if (analysis.disk.status === 'critical') {
            recommendations.push('Implement disk cleanup or increase storage capacity');
        }

        return recommendations;
    }

    dispose(): void {
        this.isInitialized = false;
        this.metricsHistory = [];
    }
}


// npm run test -- tests/suite/workflow/production/resource/metrics/resource-metrics-analyzer.test.ts