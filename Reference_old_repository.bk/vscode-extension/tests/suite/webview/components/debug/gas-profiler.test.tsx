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
            logOperation: jest.fn().mockImplementation(async (_, __, fn) => fn())
        })
    }
}));

import React from 'react';
import { describe, expect, test, beforeEach } from '@jest/globals';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { GasProfiler } from '../../../../../webview/components/debug/gas-profiler';
import { MockVSCodeAPI } from '../../../../mockes/vscode-api';

describe('GasProfiler', () => {
    let mockVSCode: MockVSCodeAPI;
    
    beforeEach(() => {
        mockVSCode = new MockVSCodeAPI();
        (mockVSCode as any).postMessage = jest.fn();
    });

    test('renders initial state correctly', () => {
        const { getByTestId } = render(<GasProfiler vscode={mockVSCode} />);
        expect(getByTestId('gas-profiler')).toBeTruthy();
        expect(getByTestId('analyze-button')).toBeTruthy();
    });

    test('shows gas analysis progress', async () => {
        const { getByTestId } = render(<GasProfiler vscode={mockVSCode} />);
        fireEvent.click(getByTestId('analyze-button'));
        
        await waitFor(() => {
            expect(getByTestId('analysis-progress')).toBeTruthy();
        });
    });

    test('displays function gas costs', async () => {
        const { getByTestId } = render(<GasProfiler vscode={mockVSCode} />);
        
        fireEvent.click(getByTestId('analyze-button'));
        
        window.postMessage({
            type: 'functionGasCosts',
            data: {
                'transfer()': '21000',
                'approve()': '46000'
            }
        }, '*');

        await waitFor(() => {
            expect(getByTestId('gas-breakdown')).toBeTruthy();
        });
    });

    test('shows optimization suggestions', async () => {
        const { getByTestId } = render(<GasProfiler vscode={mockVSCode} />);
        
        fireEvent.click(getByTestId('analyze-button'));
        
        window.postMessage({
            type: 'optimizationSuggestions',
            suggestions: [
                'Use uint256 instead of uint8',
                'Remove redundant storage reads'
            ]
        }, '*');

        await waitFor(() => {
            expect(getByTestId('optimization-suggestions')).toBeTruthy();
        });
    });

    test('handles analysis errors', async () => {
        const { getByTestId } = render(<GasProfiler vscode={mockVSCode} />);
        
        fireEvent.click(getByTestId('analyze-button'));
        
        window.postMessage({
            type: 'analysisError',
            error: 'Failed to analyze gas usage'
        }, '*');

        await waitFor(() => {
            expect(getByTestId('error-message')).toBeTruthy();
        });
    });
});


//  npm run test -- tests/suite/webview/components/debug/gas-profiler.test.tsx