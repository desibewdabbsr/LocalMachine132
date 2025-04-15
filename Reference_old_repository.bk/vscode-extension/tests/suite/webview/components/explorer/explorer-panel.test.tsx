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
        Test: 2,
        Development: 1,
        Production: 3
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
import { ExplorerPanel } from '../../../../../webview/components/explorer/explorer-panel';
import { MockVSCodeAPI } from '../../../../mockes/vscode-api';

// jest.mock('vscode', () => ({
//     window: {
//         withProgress: jest.fn((options, task: any) => task({ report: jest.fn() })),
//         showInformationMessage: jest.fn()
//     },
//     ProgressLocation: {
//         Notification: 1
//     },
//     ExtensionMode: {
//         Test: 2,
//         Development: 1,
//         Production: 3
//     }
// }));

// jest.mock('../../../../../src/utils/logger', () => ({
//     EnhancedLogger: {
//         getInstance: jest.fn().mockReturnValue({
//             info: jest.fn(),
//             error: jest.fn(),
//             logOperation: jest.fn().mockImplementation(async (_: string, __: string, fn: () => Promise<any>) => fn())
//         })
//     }
// }));

describe('ExplorerPanel', () => {
    let mockVSCode: MockVSCodeAPI;
    
    beforeEach(() => {
        jest.clearAllMocks();
        mockVSCode = new MockVSCodeAPI();
        (mockVSCode as any).postMessage = jest.fn();
        (mockVSCode as any).getState = jest.fn().mockReturnValue({
            contracts: [],
            selectedContract: null
        });
    });

    test('renders loading state initially', async () => {
        // Setup initial state with loading
        (mockVSCode as any).getState = jest.fn().mockReturnValue({
            contracts: [],
            selectedContract: null,
            isLoading: true
        });

        render(<ExplorerPanel vscode={mockVSCode} />);
        
        // Verify contracts list is rendered
        const contractsList = screen.getByText('Contract.sol');
        expect(contractsList).toBeTruthy();
    });


    test('handles contract selection', async () => {
        // Setup initial state
        (mockVSCode as any).getState = jest.fn().mockReturnValue({
            contracts: ['Contract.sol'],
            selectedContract: null,
            isLoading: false
        });

        const { rerender } = render(<ExplorerPanel vscode={mockVSCode} />);
        
        // Wait for loading to complete
        await waitFor(() => {
            expect(screen.queryByTestId('loading-indicator')).toBeFalsy();
        });

        // Verify contract list and interaction
        const contractElement = screen.getByText('Contract.sol');
        fireEvent.click(contractElement);
        
        expect(mockVSCode.postMessage).toHaveBeenCalledWith({
            command: 'getContracts',
            payload: {}
        });
    });


    test('displays contract viewer when contract is selected', async () => {
        // Setup initial state with selected contract
        (mockVSCode as any).getState = jest.fn().mockReturnValue({
            contracts: ['Contract.sol'],
            selectedContract: 'Contract.sol',
            isLoading: false
        });

        render(<ExplorerPanel vscode={mockVSCode} />);

        // Wait for loading to complete and verify components
        await waitFor(() => {
            expect(screen.queryByTestId('loading-indicator')).toBeFalsy();
            expect(screen.getByTestId('contract-viewer')).toBeTruthy();
        });
    });

    test('handles error states appropriately', async () => {
        const mockError = new Error('Failed to load contracts');
        (mockVSCode as any).postMessage = jest.fn().mockImplementation(() => {
            throw mockError;
        });

        render(<ExplorerPanel vscode={mockVSCode} />);

        await waitFor(() => {
            const errorElement = screen.getByTestId('error-message');
            expect(errorElement.textContent).toBe('Failed to load contracts');
        });
    });
});

// npm run test -- tests/suite/webview/components/explorer/explorer-panel.test.tsx