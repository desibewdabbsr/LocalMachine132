import { HardwareConfig } from '../tests/types';
// import { CommandCenter } from './commands/CommandCenter';  // Changed import path
import { PerformanceMonitor } from './metrics/PerformanceMonitor';
import { EnhancedLogger } from './utils/logger';

// Command handler interface
interface CommandHandler {
    execute(params: { timestamp: number; config: HardwareConfig }): void;
}


export class CoreModule {
    private hardwareConfig: HardwareConfig = {
        device: 'cpu',
        threads: navigator.hardwareConcurrency || 4,
        memoryLimit: 4096,
        batchSize: 8,
        memoryAllocation: 'dynamic',
        cudaCores: 0,
        cpuArchitecture: 'auto',
        multiGpu: false,
        performanceMode: 'balanced'
    };

    private commandCenter: CommandHandler;
    private performanceMonitor: PerformanceMonitor;
    private logger: EnhancedLogger;

    constructor() {
        this.logger = EnhancedLogger.getInstance();
        this.performanceMonitor = new PerformanceMonitor(this.hardwareConfig, this.logger);
        this.commandCenter = {
            execute: (params) => {
                this.logger.info(`Executing command with timestamp: ${params.timestamp}`);
            }
        };
    }

    public handleWebviewMessage(message: WebviewMessage) {
        switch (message.command) {
            case 'updateHardwareConfig':
                this.updateHardwareConfiguration(message.payload as HardwareConfig);
                break;
            case 'executeOperation':
                if (message.timestamp) {
                    this.executeCommand(message.timestamp);
                }
                break;
            default:
                this.logger.warn(`Unknown command received: ${message.command}`);
        }
    }

    public getHardwareConfig(): HardwareConfig {
        return this.hardwareConfig;
    }

    public getPerformanceMetrics() {
        return this.performanceMonitor.collectMetrics();
    }

    private updateHardwareConfiguration(config: HardwareConfig) {
        this.logger.logOperation(
            'CoreModule',
            'Updating hardware configuration',
            () => {
                this.hardwareConfig = config;
                this.performanceMonitor.collectMetrics();
                return Promise.resolve();
            }
        );
    }

    private executeCommand(timestamp: number) {
        this.commandCenter.execute({
            timestamp,
            config: this.hardwareConfig
        });
    }

    public cleanup() {
        this.performanceMonitor.cleanup();
    }
}

interface WebviewMessage {
    command: string;
    payload?: any;
    timestamp?: number;
}