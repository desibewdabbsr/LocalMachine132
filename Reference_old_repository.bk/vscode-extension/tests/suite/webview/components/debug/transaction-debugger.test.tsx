/**
 * @jest-environment jsdom
 */

import React from 'react';
import { describe, expect, test, beforeEach } from '@jest/globals';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { TransactionDebugger } from '../../../../../webview/components/debug/transaction-debugger';
import { MockVSCodeAPI } from '../../../../mockes/vscode-api';

describe('TransactionDebugger', () => {
    let mockVSCode: MockVSCodeAPI;
    
    beforeEach(() => {
        mockVSCode = new MockVSCodeAPI();
        (mockVSCode as any).postMessage = jest.fn();
    });

    test('renders initial state correctly', () => {
        const { getByTestId } = render(<TransactionDebugger vscode={mockVSCode} />);
        expect(getByTestId('tx-hash-input')).toBeTruthy();
        expect(getByTestId('debug-button')).toBeTruthy();
    });

    test('starts debugging process', async () => {
        const { getByTestId } = render(<TransactionDebugger vscode={mockVSCode} />);
        
        const input = getByTestId('tx-hash-input');
        fireEvent.change(input, { target: { value: '0x123' } });
        
        const debugButton = getByTestId('debug-button');
        fireEvent.click(debugButton);
        
        await waitFor(() => {
            expect(getByTestId('debug-progress')).toBeTruthy();
        });
    });

    test('displays stack trace', async () => {
        const { getByTestId } = render(<TransactionDebugger vscode={mockVSCode} />);
        
        fireEvent.change(getByTestId('tx-hash-input'), { 
            target: { value: '0x123' } 
        });
        fireEvent.click(getByTestId('debug-button'));

        window.postMessage({ 
            type: 'stackTrace',
            data: ['PUSH1 0x80', 'PUSH1 0x40', 'MSTORE']
        }, '*');

        await waitFor(() => {
            expect(getByTestId('stack-trace')).toBeTruthy();
        });
    });

    test('shows memory state', async () => {
        const { getByTestId } = render(<TransactionDebugger vscode={mockVSCode} />);
        
        fireEvent.change(getByTestId('tx-hash-input'), { 
            target: { value: '0x123' } 
        });
        fireEvent.click(getByTestId('debug-button'));

        window.postMessage({ 
            type: 'memoryState',
            data: '0x0000000000000000000000000000000000000000'
        }, '*');

        await waitFor(() => {
            expect(getByTestId('memory-state')).toBeTruthy();
        });
    });

    test('displays gas usage', async () => {
        const { getByTestId } = render(<TransactionDebugger vscode={mockVSCode} />);
        
        fireEvent.change(getByTestId('tx-hash-input'), { 
            target: { value: '0x123' } 
        });
        fireEvent.click(getByTestId('debug-button'));

        window.postMessage({ 
            type: 'gasUsage',
            data: '21000'
        }, '*');

        await waitFor(() => {
            expect(getByTestId('gas-usage')).toBeTruthy();
        });
    });

    test('handles debugging errors', async () => {
        const { getByTestId } = render(<TransactionDebugger vscode={mockVSCode} />);
        
        fireEvent.change(getByTestId('tx-hash-input'), { 
            target: { value: '0x123' } 
        });
        fireEvent.click(getByTestId('debug-button'));

        window.postMessage({ 
            type: 'debugError',
            error: 'Failed to load transaction'
        }, '*');

        await waitFor(() => {
            expect(getByTestId('error-message')).toBeTruthy();
        });
    });
});


// npm run test -- tests/suite/webview/components/debug/transaction-debugger.test.tsx