/**
 * @jest-environment jsdom
 */

import React from 'react';
import { describe, expect, test } from '@jest/globals';
import { render } from '@testing-library/react';
import { ChainConnectionStatus } from '../../../../../webview/components/network/ChainConnectionStatus';
import { MockVSCodeAPI } from '../../../../mockes/vscode-api';

describe('ChainConnectionStatus', () => {
    test('renders connection status correctly', () => {
        const mockVSCode = new MockVSCodeAPI();
        const { getByTestId } = render(
            <ChainConnectionStatus 
                chainId={1}
                status="connected"
                vscode={mockVSCode}
            />
        );

        const statusElement = getByTestId('status-1');
        expect(statusElement.classList.contains('status-indicator')).toBe(true);
        expect(statusElement.classList.contains('connected')).toBe(true);
        expect(statusElement.textContent).toBe('connected');
    });
});


// npm run test -- tests/suite/webview/components/network/chainconnectionstatus.test.tsx