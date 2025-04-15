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
import { NetworkHealthMonitor } from '../../../../../src/workflow/build/monitoring/network-health-monitor';
import { NetworkService } from '../../../../../src/services/network/network-service';
import { EnhancedLogger } from '../../../../../src/utils/logger';
import { ethers } from 'ethers';

describe('NetworkHealthMonitor', () => {
    let monitor: NetworkHealthMonitor;
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
                transactions: []
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

        monitor = new NetworkHealthMonitor('http://127.0.0.1:8545', mockNetworkService);
    });

    test('initializes successfully', async () => {
        await monitor.initialize();
        expect(mockProvider.getNetwork).toHaveBeenCalled();
        expect(mockLogger.info).toHaveBeenCalledWith(
            `Network health monitor initialized for http://127.0.0.1:8545`
        );
    });

    test('reports healthy status for normal conditions', async () => {
        await monitor.initialize();
        const health = await monitor.checkHealth();
        
        expect(health.status).toBe('healthy');
        expect(health.isSyncing).toBe(false);
        expect(health.peerCount).toBe(1);
    });

    test('detects degraded performance', async () => {
        await monitor.initialize();
        
        // Simulate slow response
        mockProvider.getBlockNumber.mockImplementation(() => 
            new Promise(resolve => setTimeout(() => resolve(1000), 1100))
        );

        const health = await monitor.checkHealth();
        expect(health.status).toBe('degraded');
    });

    test('handles network errors appropriately', async () => {
        await monitor.initialize();
        mockProvider.getBlockNumber.mockRejectedValueOnce(new Error('Network error'));
        
        await expect(monitor.checkHealth()).rejects.toThrow('Failed to perform health check');
    });
});

// npm run test -- tests/suite/workflow/build/monitoring/network-health-monitor.test.ts