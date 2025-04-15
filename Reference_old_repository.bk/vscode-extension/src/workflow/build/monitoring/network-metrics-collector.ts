import { EnhancedLogger } from '../../../utils/logger';
import { NetworkService } from '../../../services/network/network-service';
import { ethers } from 'ethers';

export interface NetworkMetrics {
    blockHeight: number;
    gasPrice: bigint;
    peerCount: number;
    latency: number;
    syncStatus: boolean;
    tps: number;
    mempool: {
        pending: number;
        queued: number;
    };
    timestamp: number;
}

export class NetworkMetricsCollector {
    private logger: EnhancedLogger;
    private provider!: ethers.providers.JsonRpcProvider;
    private isInitialized = false;
    private lastMetrics?: NetworkMetrics;

    constructor(
        private readonly networkUrl: string = 'http://127.0.0.1:8545',
        private readonly networkService: NetworkService
    ) {
        this.logger = EnhancedLogger.getInstance();
    }

    async initialize(): Promise<void> {
        return this.logger.logOperation('metrics-collector', 'initialize', async () => {
            try {
                this.provider = new ethers.providers.JsonRpcProvider(this.networkUrl);
                await this.validateConnection();
                this.isInitialized = true;
                this.logger.info(`Network metrics collector initialized for ${this.networkUrl}`);
            } catch (err: any) {
                this.logger.error(`Failed to initialize metrics collector: ${err}`);
                throw new Error('Metrics collector initialization failed');
            }
        });
    }
    

    async collectMetrics(): Promise<NetworkMetrics> {
        if (!this.isInitialized) {
            throw new Error('Metrics collector not initialized');
        }

        const startTime = Date.now();

        try {
            const [blockNumber, gasPrice] = await Promise.all([
                this.provider.getBlockNumber(),
                this.provider.getGasPrice()
            ]);

            const metrics: NetworkMetrics = {
                blockHeight: blockNumber,
                gasPrice: gasPrice.toBigInt(),
                peerCount: 1, // Hardhat node always returns 1 peer
                latency: Date.now() - startTime,
                syncStatus: true, // Hardhat node is always synced
                tps: await this.calculateTPS(),
                mempool: {
                    pending: 0,
                    queued: 0
                },
                timestamp: Date.now()
            };

            this.lastMetrics = metrics;
            return metrics;
        } catch (error) {
            this.logger.error(`Failed to collect metrics: ${error}`);
            throw new Error('Failed to collect network metrics');
        }
    }

    private async validateConnection(): Promise<void> {
        const network = await this.provider.getNetwork();
        if (network.chainId !== 31337) {
            throw new Error('Invalid network - expected Hardhat local network');
        }
    }

    private async calculateTPS(): Promise<number> {
        try {
            const latestBlock = await this.provider.getBlock('latest');
            if (!latestBlock || latestBlock.number === 0) return 0;

            const prevBlock = await this.provider.getBlock(latestBlock.number - 1);
            if (!prevBlock) return 0;

            const timeDiff = Math.max(latestBlock.timestamp - prevBlock.timestamp, 1);
            return latestBlock.transactions.length / timeDiff;
        } catch {
            return 0;
        }
    }

    getLastMetrics(): NetworkMetrics | undefined {
        return this.lastMetrics;
    }
}


// npm run test -- tests/suite/workflow/build/monitoring/network-metrics-collector.test.ts