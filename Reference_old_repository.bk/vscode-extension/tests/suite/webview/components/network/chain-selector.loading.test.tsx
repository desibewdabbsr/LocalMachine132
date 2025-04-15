/**
 * @jest-environment jsdom
 */

import React from 'react';
import { describe, expect, test, beforeEach } from '@jest/globals';
import { render } from '@testing-library/react';
import { ChainSelectorLoading } from '../../../../../webview/components/network/chain-selector.loading';
import { MockVSCodeAPI } from '../../../../mockes/vscode-api';

describe('ChainSelector Loading States', () => {
    let mockVSCode: MockVSCodeAPI;
    
    beforeEach(() => {
        mockVSCode = new MockVSCodeAPI();
        (mockVSCode as any).postMessage = jest.fn();
    });

    test('renders initial loading state', () => {
        const initialState = {
            chains: [],
            selectedChain: null,
            isLoading: true,
            error: null,
            gasEstimates: {},
            connectionStatus: {}
        };
        
        (mockVSCode as any).getState = jest.fn().mockReturnValue(initialState);
        const { getByTestId } = render(<ChainSelectorLoading vscode={mockVSCode} />);
        expect(getByTestId('loading-indicator')).toBeTruthy();
    });
});


// npm run test -- tests/suite/webview/components/network/chain-selector.loading.test.tsx