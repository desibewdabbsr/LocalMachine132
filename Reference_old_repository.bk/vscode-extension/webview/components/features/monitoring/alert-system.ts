import { EnhancedLogger } from '../../../../src/utils/logger';
import { VSCodeAPI } from '../../../../tests/mockes/vscode-api';
import type { AlertMessage, AlertResponse } from '../../../../tests/mockes/alert-system-mock';

export interface AlertConfig {
    severity: 'critical' | 'warning' | 'info';
    threshold: number;
    metric: string;
    enabled: boolean;
}

export interface Alert {
    id: string;
    message: string;
    severity: AlertConfig['severity'];
    timestamp: number;
    metric: string;
    value: number;
    threshold: number;
}

export class AlertSystem {
    private isInitialized: boolean = false;
    private alerts: Alert[] = [];
    private configs: AlertConfig[] = [];
    private logger: EnhancedLogger;
    private healthCheckInterval?: NodeJS.Timeout;

    constructor(
        private readonly vscode: VSCodeAPI,
        private readonly refreshInterval: number = 30000
    ) {
        this.logger = EnhancedLogger.getInstance();
    }

    async initialize(): Promise<void> {
        return this.logger.logOperation('alert-system', 'initialize', async () => {
            try {
                await this.loadConfigurations();
                this.startHealthCheck();
                this.isInitialized = true;
                this.logger.info('Alert system initialized successfully');
            } catch (error) {
                this.logger.error(`Alert system initialization failed: ${error}`);
                throw new Error('Failed to initialize alert system');
            }
        });
    }

    private async loadConfigurations(): Promise<void> {
        this.logger.debug('Loading alert configurations');
        const message: AlertMessage = {
            command: 'getAlertConfigs'
        };
        
        // Cast the VSCodeAPI instance to handle our specific types
        const vscodeWithTypes = this.vscode as unknown as {
            postMessage(msg: AlertMessage): Promise<AlertResponse>;
        };
        
        const response = await vscodeWithTypes.postMessage(message);
        
        if (!response?.configs) {
            throw new Error('Invalid configuration response');
        }
        
        this.configs = response.configs;
    }
    
    

    private startHealthCheck(): void {
        this.healthCheckInterval = setInterval(() => {
            this.logger.debug('Running alert system health check');
            this.checkSystemHealth();
        }, this.refreshInterval);
    }

    async processMetricUpdate(metric: string, value: number): Promise<Alert | null> {
        return this.logger.logOperation('alert-system', 'process-metric', async () => {
            const config = this.configs.find(c => c.metric === metric && c.enabled);
            if (!config) return null;

            if (value > config.threshold) {
                const alert: Alert = {
                    id: `${Date.now()}-${metric}`,
                    message: `${metric} exceeded threshold: ${value} > ${config.threshold}`,
                    severity: config.severity,
                    timestamp: Date.now(),
                    metric,
                    value,
                    threshold: config.threshold
                };
                
                this.alerts.push(alert);
                await this.notifyVSCode(alert);
                return alert;
            }
            return null;
        });
    }

    private async notifyVSCode(alert: Alert): Promise<void> {
        await this.vscode.postMessage({
            command: 'alertTriggered',
            alert
        });
    }

    private async checkSystemHealth(): Promise<void> {
        // Health check implementation
    }

    dispose(): void {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
        }
    }
}


// npm run test -- tests/suite/webview/components/features/monitoring/alert-system.test.ts