import { EnhancedLogger } from '../../../../utils/logger';
import { PerformanceTracker } from '../../../build/monitoring/performance-tracker';
import { ResourceConfig, ResourceMetrics, ResourceMonitoringStatus } from './resource-manager-types';


export class ResourceManagerCore {
    protected readonly logger: EnhancedLogger;
    protected readonly performanceTracker: PerformanceTracker;
    protected isInitialized: boolean = false;
    protected monitoringStatus: ResourceMonitoringStatus = 'paused';

    constructor(
        protected readonly config: ResourceConfig,
        protected readonly networkUrl: string,
        protected readonly networkService: any,
        logger?: EnhancedLogger
    ) {
        this.logger = logger || EnhancedLogger.getInstance();
        this.performanceTracker = new PerformanceTracker(networkUrl, networkService);
    }

    async initialize(): Promise<void> {
        return this.logger.logOperation('resource-manager', 'initialize', async () => {
            try {
                await this.performanceTracker.initialize();
                await this.validateSystemRequirements();
                this.monitoringStatus = 'active';
                this.isInitialized = true;
                // Format the message and data into a single string
                this.logger.info(`Resource manager core initialized successfully - Config: ${JSON.stringify(this.config)}, Status: ${this.monitoringStatus}`);
            } catch (error) {
                this.monitoringStatus = 'error';
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                this.logger.error(`Resource manager initialization failed: ${errorMessage}`);
                throw new Error('Failed to initialize resource manager');
            }
        });
    }
    

    protected validateInitialization(): void {
        if (!this.isInitialized) {
            throw new Error('Resource manager not initialized');
        }
    }

    protected async validateSystemRequirements(): Promise<void> {
        const memUsage = process.memoryUsage();
        const heapUsagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
        
        if (heapUsagePercent > this.config.memoryLimit) {
            throw new Error(`Memory usage (${heapUsagePercent.toFixed(2)}%) exceeds limit (${this.config.memoryLimit}%)`);
        }
    }

    getStatus(): ResourceMonitoringStatus {
        return this.monitoringStatus;
    }

    dispose(): void {
        this.monitoringStatus = 'paused';
        this.isInitialized = false;
    }
}

// npm run test -- tests/suite/workflow/production/resource/core/resource-manager-core.test.ts