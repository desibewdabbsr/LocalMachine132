import { EnhancedLogger } from '../../../../utils/logger';
import { PerformanceTracker } from '../../../build/monitoring/performance-tracker';
import { 
    SystemMetrics, 
    MemoryMetrics, 
    CPUMetrics, 
    DiskMetrics 
} from '../core/resource-manager-types';
import * as os from 'os';

export class ResourceMetricsCollector {
    private readonly logger: EnhancedLogger;
    private readonly performanceTracker: PerformanceTracker;
    private isInitialized: boolean = false;

    constructor(
        private readonly networkUrl: string,
        private readonly networkService: any,
        logger?: EnhancedLogger
    ) {
        this.logger = logger || EnhancedLogger.getInstance();
        this.performanceTracker = new PerformanceTracker(networkUrl, networkService);
    }

    async initialize(): Promise<void> {
        return this.logger.logOperation('metrics-collector', 'initialize', async () => {
            try {
                await this.performanceTracker.initialize();
                this.isInitialized = true;
                this.logger.info(`Resource metrics collector initialized successfully`);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                this.logger.error(`Metrics collector initialization failed: ${errorMessage}`);
                throw new Error('Failed to initialize metrics collector');
            }
        });
    }

    async collectMetrics(): Promise<SystemMetrics> {
        if (!this.isInitialized) {
            throw new Error('Metrics collector not initialized');
        }
    
        const sessionId = await this.performanceTracker.startTracking('metrics-collection');
        
        // Collect metrics outside of performance tracking
        const [memoryMetrics, cpuMetrics, diskMetrics] = await Promise.all([
            this.collectMemoryMetrics(),
            this.collectCPUMetrics(),
            this.collectDiskMetrics()
        ]);
    
        // Track the operation and get performance data
        await this.performanceTracker.trackOperation(sessionId, async () => {
            // Operation being tracked
            return { memory: memoryMetrics, cpu: cpuMetrics, disk: diskMetrics };
        });
    
        // Return the complete metrics
        return {
            memory: memoryMetrics,
            cpu: cpuMetrics,
            disk: diskMetrics,
            timestamp: Date.now()
        };
    }
    

    private async collectMemoryMetrics(): Promise<MemoryMetrics> {
        const memUsage = process.memoryUsage();
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const used = totalMem - freeMem;

        return {
            used,
            total: totalMem,
            percentage: (used / totalMem) * 100,
            heapStats: {
                heapUsed: memUsage.heapUsed,
                heapTotal: memUsage.heapTotal,
                external: memUsage.external
            }
        };
    }

    private async collectCPUMetrics(): Promise<CPUMetrics> {
        const cpus = os.cpus();
        const loadAvg = os.loadavg();
        
        // Calculate CPU usage percentage
        const usage = cpus.reduce((acc, cpu) => {
            const total = Object.values(cpu.times).reduce((a, b) => a + b);
            const idle = cpu.times.idle;
            return acc + ((total - idle) / total) * 100;
        }, 0) / cpus.length;

        return {
            usage,
            loadAverage: loadAvg,
            cores: cpus.length,
            speed: cpus[0].speed
        };
    }

    private async collectDiskMetrics(): Promise<DiskMetrics> {
        // Basic implementation - extend based on requirements
        return {
            used: 0,
            available: 0,
            percentage: 0,
            readSpeed: 0,
            writeSpeed: 0
        };
    }

    dispose(): void {
        this.isInitialized = false;
    }
}


// npm run test -- tests/suite/workflow/production/resource/metrics/resource-metrics-collector.test.ts