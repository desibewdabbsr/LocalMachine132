import { EventEmitter } from 'events';
import { ExtensionContext } from 'vscode';
import { EnhancedLogger } from '../utils/logger';
import { CodyService } from './cody-service';
import { ToolchainService } from './toolchain-service';
import { SecurityService } from './security-service';
import { MetricsService } from './metrics-service';

interface ServiceStateEvent {
    type: 'serviceStarted' | 'serviceStopped' | 'serviceError';
    service: string;
    error?: Error;
    status?: 'success' | 'failed' | 'pending';
}

export class ServiceManager {
    private static instance: ServiceManager;
    private readonly eventEmitter = new EventEmitter();
    private services: {
        codyService?: CodyService;
        toolchainService?: ToolchainService;
        securityService?: SecurityService;
        metricsService?: MetricsService;
    } = {};

    private constructor(
        private readonly context: ExtensionContext,
        private readonly logger: EnhancedLogger
    ) {}

    public static async initialize(
        context: ExtensionContext,
        logger: EnhancedLogger
    ): Promise<ServiceManager> {
        if (!ServiceManager.instance) {
            ServiceManager.instance = new ServiceManager(context, logger);
            await ServiceManager.instance.initializeServices();
        }
        return ServiceManager.instance;
    }

    public async initializeServices() {
        this.logger.info('Initializing services...');
        
        this.services.metricsService = new MetricsService(this.context, this.logger);
        this.services.codyService = new CodyService(this.context, this.logger);
        this.services.toolchainService = new ToolchainService(this.context, this.logger);
        this.services.securityService = new SecurityService(this.context, this.logger);

        return this.services;
    }

    public getServices() {
        return this.services;
    }

    public onServiceStateChange(callback: (event: ServiceStateEvent) => void): void {
        this.eventEmitter.on('serviceState', callback);
    }

    public async startServices(): Promise<void> {
        try {
            await this.initializeServices();
            this.eventEmitter.emit('serviceState', {
                type: 'serviceStarted',
                service: 'codyService',
                status: 'success'
            });
        } catch (error) {
            this.eventEmitter.emit('serviceState', {
                type: 'serviceError',
                service: 'codyService',
                error
            });
            throw error;
        }
    }
}