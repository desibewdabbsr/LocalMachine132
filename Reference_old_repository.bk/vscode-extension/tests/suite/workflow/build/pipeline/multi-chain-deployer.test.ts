/**
 * @jest-environment jsdom
 */

jest.mock('vscode', () => ({
    window: {
        withProgress: jest.fn((options, task) => task({ report: jest.fn() })),
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
            logOperation: jest.fn().mockImplementation(async (_, __, fn) => fn()),
            getConfig: jest.fn().mockReturnValue({
                logLevel: 'INFO',
                mode: 'development'
            })
        })
    }
}));

import { describe, expect, test, beforeEach } from '@jest/globals';
import { MultiChainDeployer } from '../../../../../src/workflow/build/pipeline/multi-chain-deployer';
import { NetworkProvider, NetworkProviderService } from '../../../../../src/services/network/network-provider';
import { ContractBuilder } from '../../../../../src/workflow/build/pipeline/contract-builder';
import { EnhancedLogger } from '../../../../../src/utils/logger';
import { ethers } from 'ethers';

describe('MultiChainDeployer', () => {
    let multiChainDeployer: MultiChainDeployer;
    let mockNetworkService: jest.Mocked<NetworkProvider>; 
    let mockContractBuilder: jest.Mocked<ContractBuilder>;
    let mockLogger: jest.Mocked<EnhancedLogger>;

    const mockChains = [
        {
            chainId: 1,
            rpcUrl: 'https://mainnet.infura.io',
            name: 'Mainnet',
            verifyContract: true
        },
        {
            chainId: 42161,
            rpcUrl: 'https://arbitrum.io',
            name: 'Arbitrum',
            verifyContract: false
        }
    ];

    beforeEach(() => {
        mockNetworkService = {
            connect: jest.fn().mockResolvedValue(undefined),
            deploy: jest.fn().mockResolvedValue({
                address: '0x123',
                deployTransaction: { hash: '0xabc' }
            }),
            verify: jest.fn().mockResolvedValue({ url: 'https://etherscan.io' }),
            getNetworkProvider: jest.fn().mockResolvedValue(new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545'))
        } as any;

        mockContractBuilder = {
            buildContract: jest.fn().mockResolvedValue({
                abi: [],
                bytecode: '0x',
                contractName: 'Test'
            })
        } as any;

        mockLogger = {
            debug: jest.fn(),
            info: jest.fn(),
            error: jest.fn(),
            logOperation: jest.fn().mockImplementation(async (_, __, fn) => fn())
        } as any;

        (EnhancedLogger.getInstance as jest.Mock).mockReturnValue(mockLogger);
        multiChainDeployer = new MultiChainDeployer(
            mockNetworkService,
            mockContractBuilder,
            mockChains
        );
    });

    test('initializes successfully', async () => {
        await multiChainDeployer.initialize();
        expect(mockLogger.info).toHaveBeenCalledWith(
            'Multi-chain deployer initialized successfully'
        );
    });

    test('deploys contract to multiple chains', async () => {
        await multiChainDeployer.initialize();
        const results = await multiChainDeployer.deployToChains('Test.sol');

        expect(results).toHaveLength(2);
        expect(results[0]).toEqual(expect.objectContaining({
            chainId: 1,
            address: '0x123',
            txHash: '0xabc'
        }));
    });

    test('handles deployment failures gracefully', async () => {
        await multiChainDeployer.initialize();
        mockNetworkService.deploy.mockRejectedValueOnce(new Error('Deployment failed'));

        await expect(multiChainDeployer.deployToChains('Test.sol'))
            .rejects.toThrow('Deployment failed on Mainnet');
    });

    test('validates chain configurations', async () => {
        const invalidDeployer = new MultiChainDeployer(
            mockNetworkService,
            mockContractBuilder,
            [{ chainId: 1, name: 'Invalid', verifyContract: false } as any]
        );

        await expect(invalidDeployer.initialize())
            .rejects.toThrow('Invalid chain configuration');
    });
});

// npm run test -- tests/suite/workflow/build/pipeline/multi-chain-deployer.test.ts