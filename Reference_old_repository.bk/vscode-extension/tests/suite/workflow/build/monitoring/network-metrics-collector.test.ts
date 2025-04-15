/**
 * @jest-environment jsdom
 */

jest.mock('vscode', () => ({
    window: {
        withProgress: jest.fn((options, task) => task({ 
            report: jest.fn()
        })),
        showInformationMessage: jest.fn()
    },
    ProgressLocation: {
        Notification: 1
    }
}));

jest.mock('../../../../../src/utils/logger', () => ({
    EnhancedLogger: {
        getInstance: jest.fn().mockReturnValue({
            info: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
            logOperation: jest.fn().mockImplementation((_, __, fn) => fn()),
            getConfig: jest.fn().mockReturnValue({
                logLevel: 'INFO',
                mode: 'development'
            })
        })
    }
}));

jest.mock('ethers');

import { describe, expect, test, beforeEach } from '@jest/globals';
import { NetworkMetricsCollector } from '../../../../../src/workflow/build/monitoring/network-metrics-collector';
import { NetworkService } from '../../../../../src/services/network/network-service';
import { EnhancedLogger } from '../../../../../src/utils/logger';
import { ethers } from 'ethers';

describe('NetworkMetricsCollector', () => {
    let collector: NetworkMetricsCollector;
    let mockProvider: any;
    let mockNetworkService: jest.Mocked<NetworkService>;
    let mockLogger: jest.Mocked<EnhancedLogger>;

    beforeEach(() => {
        jest.clearAllMocks();

        mockProvider = {
            getNetwork: jest.fn().mockResolvedValue({ chainId: 31337, name: 'hardhat' }),
            getBlockNumber: jest.fn().mockResolvedValue(1000),
            getGasPrice: jest.fn().mockResolvedValue({
                toBigInt: () => BigInt(20000000000)
            }),
            getBlock: jest.fn().mockResolvedValue({
                number: 1000,
                timestamp: Math.floor(Date.now() / 1000),
                transactions: []
            })
        };

        jest.spyOn(ethers.providers, 'JsonRpcProvider')
            .mockImplementation(() => mockProvider);

        mockNetworkService = {
            connect: jest.fn().mockResolvedValue(undefined)
        } as any;

        mockLogger = {
            debug: jest.fn(),
            info: jest.fn(),
            error: jest.fn(),
            logOperation: jest.fn().mockImplementation((_, __, fn) => fn())
        } as any;

        (EnhancedLogger.getInstance as jest.Mock).mockReturnValue(mockLogger);

        collector = new NetworkMetricsCollector('http://127.0.0.1:8545', mockNetworkService);
    });

    test('initializes with Hardhat network', async () => {
        await collector.initialize();
        expect(mockProvider.getNetwork).toHaveBeenCalled();
        expect(mockLogger.info).toHaveBeenCalledWith(
            `Network metrics collector initialized for http://127.0.0.1:8545`
        );
    });
    

    test('collects metrics from Hardhat node', async () => {
        await collector.initialize();
        const metrics = await collector.collectMetrics();

        expect(metrics).toEqual({
            blockHeight: expect.any(Number),
            gasPrice: expect.any(BigInt),
            peerCount: 1,
            latency: expect.any(Number),
            syncStatus: true,
            tps: expect.any(Number),
            mempool: {
                pending: 0,
                queued: 0
            },
            timestamp: expect.any(Number)
        });
    });

    test('validates Hardhat network chainId', async () => {
        mockProvider.getNetwork.mockResolvedValueOnce({ chainId: 1, name: 'mainnet' });
        await expect(collector.initialize()).rejects.toThrow('Metrics collector initialization failed');
    });

    test('handles block retrieval errors gracefully', async () => {
        await collector.initialize();
        mockProvider.getBlock.mockRejectedValueOnce(new Error('Block not found'));
        const metrics = await collector.collectMetrics();
        expect(metrics.tps).toBe(0);
    });
});


// npm run test -- tests/suite/workflow/build/monitoring/network-metrics-collector.test.ts