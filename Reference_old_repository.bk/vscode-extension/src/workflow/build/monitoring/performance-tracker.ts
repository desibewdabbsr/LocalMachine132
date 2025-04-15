import { EnhancedLogger } from '../../../utils/logger';
import { NetworkService } from '../../../services/network/network-service';
import { ethers } from 'ethers';
import * as vscode from 'vscode';

export interface PerformanceMetrics {
    executionTime: number;
    memoryUsage: {
        heapUsed: number;
        heapTotal: number;
    };
    transactionThroughput: number;
    gasEfficiency: number;
    operationSuccess: boolean;
    timestamp: number;
    blockRange: {
        start: number;
        end: number;
    };
}

export interface TrackingSession {
    id: string;
    startTime: number;
    metrics: PerformanceMetrics[];
    status: 'active' | 'completed' | 'failed';
}

export class PerformanceTracker {
    private logger: EnhancedLogger;
    private provider!: ethers.providers.JsonRpcProvider;
    private isInitialized = false;
    private activeSessions: Map<string, TrackingSession> = new Map();

    constructor(
        private readonly networkUrl: string = 'http://127.0.0.1:8545',
        private readonly networkService: NetworkService
    ) {
        this.logger = EnhancedLogger.getInstance();
    }

    async initialize(): Promise<void> {
        return this.logger.logOperation('performance-tracker', 'initialize', async () => {
            try {
                this.provider = new ethers.providers.JsonRpcProvider(this.networkUrl);
                await this.validateConnection();
                this.isInitialized = true;
                this.logger.info(`Performance tracker initialized for ${this.networkUrl}`);
            } catch (err: any) {
                this.logger.error(`Failed to initialize performance tracker: ${err}`);
                throw new Error('Performance tracker initialization failed');
            }
        });
    }

    async startTracking(operationId: string): Promise<string> {
        if (!this.isInitialized) {
            throw new Error('Performance tracker not initialized');
        }

        const sessionId = `${operationId}-${Date.now()}`;
        const session: TrackingSession = {
            id: sessionId,
            startTime: Date.now(),
            metrics: [],
            status: 'active'
        };

        this.activeSessions.set(sessionId, session);
        this.logger.info(`Started performance tracking session ${sessionId}`);
        return sessionId;
    }

    async trackOperation(sessionId: string, operation: () => Promise<any>): Promise<PerformanceMetrics> {
        return vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Tracking Performance',
            cancellable: false
        }, async (progress) => {
            const startBlock = await this.provider.getBlockNumber();
            const startTime = Date.now();
            const startMemory = process.memoryUsage();

            progress.report({ message: 'Operation started', increment: 20 });

            try {
                await operation();
                progress.report({ message: 'Operation completed', increment: 40 });

                const endBlock = await this.provider.getBlockNumber();
                const endTime = Date.now();
                const endMemory = process.memoryUsage();

                progress.report({ message: 'Calculating metrics', increment: 40 });

                const metrics = await this.calculateMetrics(
                    startBlock, endBlock,
                    startTime, endTime,
                    startMemory, endMemory
                );

                this.updateSession(sessionId, metrics);
                return metrics;
            } catch (err: any) {
                this.logger.error(`Operation tracking failed: ${err}`);
                throw new Error('Performance tracking failed');
            }
        });
    }

    private async calculateMetrics(
        startBlock: number,
        endBlock: number,
        startTime: number,
        endTime: number,
        startMemory: NodeJS.MemoryUsage,
        endMemory: NodeJS.MemoryUsage
    ): Promise<PerformanceMetrics> {
        const executionTime = endTime - startTime;
        const blockRange = { start: startBlock, end: endBlock };
        const transactionCount = await this.getTransactionCount(blockRange);

        return {
            executionTime,
            memoryUsage: {
                heapUsed: endMemory.heapUsed - startMemory.heapUsed,
                heapTotal: endMemory.heapTotal
            },
            transactionThroughput: transactionCount / (executionTime / 1000),
            gasEfficiency: await this.calculateGasEfficiency(blockRange),
            operationSuccess: true,
            timestamp: Date.now(),
            blockRange
        };
    }

    private async validateConnection(): Promise<void> {
        const network = await this.provider.getNetwork();
        if (network.chainId !== 31337) {
            throw new Error('Invalid network - expected Hardhat local network');
        }
    }

    private async getTransactionCount(blockRange: { start: number; end: number }): Promise<number> {
        let count = 0;
        for (let i = blockRange.start; i <= blockRange.end; i++) {
            const block = await this.provider.getBlock(i);
            count += block?.transactions.length || 0;
        }
        return count;
    }

    private async calculateGasEfficiency(blockRange: { start: number; end: number }): Promise<number> {
        const gasUsed = await this.getTotalGasUsed(blockRange);
        const transactionCount = await this.getTransactionCount(blockRange);
        return transactionCount > 0 ? gasUsed / transactionCount : 0;
    }

    private async getTotalGasUsed(blockRange: { start: number; end: number }): Promise<number> {
        let totalGas = 0;
        for (let i = blockRange.start; i <= blockRange.end; i++) {
            const block = await this.provider.getBlock(i);
            if (block) {
                totalGas += block.gasUsed?.toNumber() || 0;
            }
        }
        return totalGas;
    }

    private updateSession(sessionId: string, metrics: PerformanceMetrics): void {
        const session = this.activeSessions.get(sessionId);
        if (session) {
            session.metrics.push(metrics);
            this.logger.info(`Updated metrics for session ${sessionId}`);
        }
    }

    getSessionMetrics(sessionId: string): PerformanceMetrics[] | undefined {
        return this.activeSessions.get(sessionId)?.metrics;
    }
}


// npm run test -- tests/suite/workflow/build/monitoring/performance-tracker.test.ts