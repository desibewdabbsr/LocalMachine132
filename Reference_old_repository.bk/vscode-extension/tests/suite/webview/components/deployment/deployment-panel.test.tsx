/**
 * @jest-environment jsdom
 */

import React from 'react';
import { describe, expect, test, beforeEach } from '@jest/globals';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { DeploymentPanel } from '../../../../../webview/components/deployment/deployment-panel';
import { MockVSCodeAPI } from '../../../../mockes/vscode-api';

describe('DeploymentPanel', () => {
    let mockVSCode: MockVSCodeAPI;
    
    beforeEach(() => {
        mockVSCode = new MockVSCodeAPI();
        (mockVSCode as any).postMessage = jest.fn();
    });

    test('renders initial state correctly', () => {
        const { getByTestId } = render(<DeploymentPanel vscode={mockVSCode} />);
        expect(getByTestId('deploy-button')).toBeTruthy();
    });

    test('shows progress during deployment', async () => {
        const { getByTestId } = render(<DeploymentPanel vscode={mockVSCode} />);
        
        fireEvent.click(getByTestId('deploy-button'));
        
        await waitFor(() => {
            expect(getByTestId('progress-indicator')).toBeTruthy();
        });
    });

    test('handles successful deployment', async () => {
        const { getByTestId } = render(<DeploymentPanel vscode={mockVSCode} />);
        
        fireEvent.click(getByTestId('deploy-button'));

        // Simulate successful deployment
        window.postMessage({ 
            type: 'deploymentSuccess',
            address: '0x123'
        }, '*');

        await waitFor(() => {
            expect(getByTestId('success-message')).toBeTruthy();
        });
    });

    test('handles deployment errors', async () => {
        const { getByTestId } = render(<DeploymentPanel vscode={mockVSCode} />);
        
        fireEvent.click(getByTestId('deploy-button'));

        // Simulate error
        window.postMessage({ 
            type: 'deploymentError',
            error: 'Failed to deploy'
        }, '*');

        await waitFor(() => {
            expect(getByTestId('error-message')).toBeTruthy();
        });
    });

    test('updates gas estimates', async () => {
        const { getByTestId } = render(<DeploymentPanel vscode={mockVSCode} />);
        
        fireEvent.click(getByTestId('deploy-button'));

        // Simulate gas estimate
        window.postMessage({ 
            type: 'gasEstimate',
            estimate: '100000'
        }, '*');

        await waitFor(() => {
            const progressIndicator = getByTestId('progress-indicator');
            expect(progressIndicator.textContent).toContain('100000');
        });
    });
});



// npm run test -- tests/suite/webview/components/deployment/deployment-panel.test.tsx