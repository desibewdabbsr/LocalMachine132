/**
 * @jest-environment jsdom
 */

jest.mock('vscode', () => ({
    window: {
        withProgress: jest.fn((options, task: any) => task({ report: jest.fn() })),
        showInformationMessage: jest.fn()
    },
    ProgressLocation: {
        Notification: 1
    },
    ExtensionMode: {
        Test: 2
    }
}));

jest.mock('../../../../../src/utils/logger', () => ({
    EnhancedLogger: {
        getInstance: jest.fn().mockReturnValue({
            info: jest.fn(),
            error: jest.fn(),
            logOperation: jest.fn().mockImplementation(async (_: string, __: string, fn: () => Promise<any>) => fn())
        })
    }
}));

import React from 'react';
import { describe, expect, test, beforeEach } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChainSelector } from '../../../../../webview/components/network/chain-selector';
import { MockVSCodeAPI } from '../../../../mockes/vscode-api';

describe('ChainSelector', () => {
    let mockVSCode: MockVSCodeAPI;
    let logger: jest.SpyInstance;

    beforeEach(() => {
        mockVSCode = new MockVSCodeAPI();
        (mockVSCode as any).postMessage = jest.fn();
        (mockVSCode as any).getState = jest.fn().mockReturnValue({
            chains: [],
            selectedChain: null,
            isLoading: true
        });
        logger = jest.spyOn(console, 'log');

    });






    test('displays available chains after loading', async () => {
        (mockVSCode as any).getState = jest.fn().mockReturnValue({
            chains: [
                {
                    id: 1,
                    name: 'Ethereum Mainnet',
                    rpcUrl: 'https://mainnet.infura.io/v3/',
                    status: 'disconnected'
                }
            ],
            selectedChain: null,
            isLoading: false
        });

        render(<ChainSelector vscode={mockVSCode} />);
        
        const chainElement = screen.getByText('Ethereum Mainnet');
        expect(chainElement).toBeTruthy();
    });

    test('handles chain selection', async () => {
        (mockVSCode as any).getState = jest.fn().mockReturnValue({
            chains: [
                {
                    id: 1,
                    name: 'Ethereum Mainnet',
                    rpcUrl: 'https://mainnet.infura.io/v3/',
                    status: 'disconnected'
                }
            ],
            selectedChain: null,
            isLoading: false
        });

        render(<ChainSelector vscode={mockVSCode} />);

        const chainElement = screen.getByText('Ethereum Mainnet');
        fireEvent.click(chainElement);

        expect(mockVSCode.postMessage).toHaveBeenCalledWith({
            command: 'switchChain',
            payload: { chainId: 1 }
        });
    });

    test('displays gas prices when available', () => {
        (mockVSCode as any).getState = jest.fn().mockReturnValue({
            chains: [
                {
                    id: 1,
                    name: 'Ethereum Mainnet',
                    rpcUrl: 'https://mainnet.infura.io/v3/',
                    status: 'connected'
                }
            ],
            selectedChain: null,
            isLoading: false,
            gasEstimates: {
                1: '50 gwei'
            }
        });

        render(<ChainSelector vscode={mockVSCode} />);
        
        const gasPriceElement = screen.getByText('Gas: 50 gwei');
        expect(gasPriceElement).toBeTruthy();
    });







    test('handles network errors appropriately', async () => {
        const mockError = new Error('Network connection failed');
        (mockVSCode as any).postMessage = jest.fn().mockImplementation(() => {
            throw mockError;
        });

        render(<ChainSelector vscode={mockVSCode} />);

        const errorElement = await screen.findByTestId('error-message');
        expect(errorElement.textContent).toBe('Network connection failed');
    });
});


// npm run test -- tests/suite/webview/components/network/chain-selector.test.tsx