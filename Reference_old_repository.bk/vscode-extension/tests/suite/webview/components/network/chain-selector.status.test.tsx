/**
 * @jest-environment jsdom
 */

import React from 'react';
import { describe, expect, test, beforeEach } from '@jest/globals';
import { render } from '@testing-library/react';
import { ChainConnectionStatus } from '../../../../../webview/components/network/ChainConnectionStatus';
import { MockVSCodeAPI } from '../../../../mockes/vscode-api';

describe('ChainSelector Status Integration', () => {
    let mockVSCode: MockVSCodeAPI;
    
    beforeEach(() => {
        mockVSCode = new MockVSCodeAPI();
        (mockVSCode as any).postMessage = jest.fn();
    });

    test('shows connection status indicators', () => {
        const chainState = {
            chainId: 1,
            status: 'connected'
        };
        
        (mockVSCode as any).getState = jest.fn().mockReturnValue(chainState);
        const { getByTestId } = render(
            <ChainConnectionStatus 
                chainId={chainState.chainId}
                status={chainState.status}
                vscode={mockVSCode}
            />
        );

        const statusElement = getByTestId('status-1');
        expect(statusElement.classList.contains('status-indicator')).toBe(true);
        expect(statusElement.classList.contains('connected')).toBe(true);
        expect(statusElement.textContent).toBe('connected');
    });

    test('updates status when connection changes', () => {
        const initialState = {
            chainId: 1,
            status: 'disconnected'
        };
        
        (mockVSCode as any).getState = jest.fn().mockReturnValue(initialState);
        const { getByTestId, rerender } = render(
            <ChainConnectionStatus 
                chainId={initialState.chainId}
                status={initialState.status}
                vscode={mockVSCode}
            />
        );

        expect(getByTestId('status-1').textContent).toBe('disconnected');

        const connectedState = {
            chainId: 1,
            status: 'connected'
        };
        
        rerender(
            <ChainConnectionStatus 
                chainId={connectedState.chainId}
                status={connectedState.status}
                vscode={mockVSCode}
            />
        );

        expect(getByTestId('status-1').textContent).toBe('connected');
    });
});


// npm run test -- tests/suite/webview/components/network/chain-selector.status.test.tsx