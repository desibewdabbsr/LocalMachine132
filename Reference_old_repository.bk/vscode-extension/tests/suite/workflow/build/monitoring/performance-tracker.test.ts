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
import { PerformanceTracker } from '../../../../../src/workflow/build/monitoring/performance-tracker';
import { NetworkService } from '../../../../../src/services/network/network-service';
import { EnhancedLogger } from '../../../../../src/utils/logger';
import { ethers } from 'ethers';

describe('PerformanceTracker', () => {
    let tracker: PerformanceTracker;
    let mockProvider: any;
    let mockNetworkService: jest.Mocked<NetworkService>;
    let mockLogger: jest.Mocked<EnhancedLogger>;

    beforeEach(() => {
        jest.clearAllMocks();

        mockProvider = {
            getNetwork: jest.fn().mockResolvedValue({ chainId: 31337, name: 'hardhat' }),
            getBlockNumber: jest.fn().mockResolvedValue(1000),
            getBlock: jest.fn().mockResolvedValue({
                number: 1000,
                timestamp: Math.floor(Date.now() / 1000),
                transactions: [],
                gasUsed: ethers.BigNumber.from(21000)
            }),
            send: jest.fn().mockImplementation((method: string) => {
                if (method === 'eth_syncing') return Promise.resolve(false);
                return Promise.resolve(null);
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

        tracker = new PerformanceTracker('http://127.0.0.1:8545', mockNetworkService);
    });

    test('initializes successfully', async () => {
        await tracker.initialize();
        expect(mockProvider.getNetwork).toHaveBeenCalled();
        expect(mockLogger.info).toHaveBeenCalledWith(
            `Performance tracker initialized for http://127.0.0.1:8545`
        );
    });

    test('starts tracking session correctly', async () => {
        await tracker.initialize();
        const sessionId = await tracker.startTracking('test-operation');
        expect(sessionId).toMatch(/test-operation-\d+/);
    });

    test('tracks operation performance metrics', async () => {
        await tracker.initialize();
        const sessionId = await tracker.startTracking('test-operation');
        
        const metrics = await tracker.trackOperation(sessionId, async () => {
            await new Promise(resolve => setTimeout(resolve, 100));
        });

        expect(metrics).toEqual({
            executionTime: expect.any(Number),
            memoryUsage: {
                heapUsed: expect.any(Number),
                heapTotal: expect.any(Number)
            },
            transactionThroughput: expect.any(Number),
            gasEfficiency: expect.any(Number),
            operationSuccess: true,
            timestamp: expect.any(Number),
            blockRange: {
                start: expect.any(Number),
                end: expect.any(Number)
            }
        });
    });

    test('handles operation failures', async () => {
        await tracker.initialize();
        const sessionId = await tracker.startTracking('failed-operation');

        await expect(
            tracker.trackOperation(sessionId, async () => {
                throw new Error('Operation failed');
            })
        ).rejects.toThrow('Performance tracking failed');
    });

    test('validates network connection', async () => {
        mockProvider.getNetwork.mockResolvedValueOnce({ chainId: 1, name: 'mainnet' });
        await expect(tracker.initialize()).rejects.toThrow('Performance tracker initialization failed');
    });

    test('retrieves session metrics', async () => {
        await tracker.initialize();
        const sessionId = await tracker.startTracking('test-operation');
        await tracker.trackOperation(sessionId, async () => {});

        const metrics = tracker.getSessionMetrics(sessionId);
        expect(metrics).toHaveLength(1);
        expect(metrics![0]).toHaveProperty('executionTime');
    });
});

// npm run test -- tests/suite/workflow/build/monitoring/performance-tracker.test.ts