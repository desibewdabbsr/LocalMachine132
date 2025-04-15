import { EnhancedLogger } from '../../../utils/logger';
import { NetworkService } from '../../../services/network/network-service';
import { ethers } from 'ethers';

export interface NetworkHealth {
    status: 'healthy' | 'degraded' | 'unhealthy';
    latency: number;
    blockTime: number;
    peerCount: number;
    lastBlockTime: number;
    isSyncing: boolean;
    errors: string[];
    timestamp: number;
}

export class NetworkHealthMonitor {
    private logger: EnhancedLogger;
    private provider!: ethers.providers.JsonRpcProvider;
    private isInitialized = false;
    private lastHealth?: NetworkHealth;
    private readonly healthyLatencyThreshold = 1000; // 1 second
    private readonly healthyBlockTimeThreshold = 15000; // 15 seconds

    constructor(
        private readonly networkUrl: string = 'http://127.0.0.1:8545',
        private readonly networkService: NetworkService
    ) {
        this.logger = EnhancedLogger.getInstance();
    }

    async initialize(): Promise<void> {
        return this.logger.logOperation('health-monitor', 'initialize', async () => {
            try {
                this.provider = new ethers.providers.JsonRpcProvider(this.networkUrl);
                await this.validateConnection();
                this.isInitialized = true;
                this.logger.info(`Network health monitor initialized for ${this.networkUrl}`);
            } catch (err: any) {
                this.logger.error(`Failed to initialize health monitor: ${err}`);
                throw new Error('Health monitor initialization failed');
            }
        });
    }

    async checkHealth(): Promise<NetworkHealth> {
        if (!this.isInitialized) {
            throw new Error('Health monitor not initialized');
        }

        const startTime = Date.now();
        const errors: string[] = [];

        try {
            const [blockNumber, isSyncing] = await Promise.all([
                this.provider.getBlockNumber(),
                this.provider.send('eth_syncing', [])
            ]);

            const latency = Date.now() - startTime;
            const block = await this.provider.getBlock(blockNumber);
            const blockTime = block ? (Date.now() / 1000) - block.timestamp : 0;

            const health: NetworkHealth = {
                status: this.determineStatus(latency, blockTime, errors),
                latency,
                blockTime,
                peerCount: 1, // Hardhat always returns 1
                lastBlockTime: block?.timestamp || 0,
                isSyncing: !!isSyncing,
                errors,
                timestamp: Date.now()
            };

            this.lastHealth = health;
            return health;
        } catch (err: any) {
            this.logger.error(`Health check failed: ${err}`);
            throw new Error('Failed to perform health check');
        }
    }

    private determineStatus(latency: number, blockTime: number, errors: string[]): NetworkHealth['status'] {
        if (errors.length > 0) return 'unhealthy';
        if (latency > this.healthyLatencyThreshold || blockTime > this.healthyBlockTimeThreshold) {
            return 'degraded';
        }
        return 'healthy';
    }

    private async validateConnection(): Promise<void> {
        const network = await this.provider.getNetwork();
        if (network.chainId !== 31337) {
            throw new Error('Invalid network - expected Hardhat local network');
        }
    }

    getLastHealth(): NetworkHealth | undefined {
        return this.lastHealth;
    }
}


// npm run test -- tests/suite/workflow/build/monitoring/network-health-monitor.test.ts