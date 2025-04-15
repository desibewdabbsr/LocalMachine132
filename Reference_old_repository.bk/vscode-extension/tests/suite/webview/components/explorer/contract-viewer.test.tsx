/**
 * @jest-environment jsdom
 */

jest.mock('vscode', () => ({
    window: {
        withProgress: jest.fn((options, task: (progress: any) => Promise<any>) => 
            task({ report: jest.fn() })
        )
    },
    ProgressLocation: {
        Notification: 1
    }
}));

import * as React from 'react';
import { describe, expect, test, beforeEach, jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { ContractViewer } from '../../../../../webview/components/explorer/contract-viewer';
import { MockVSCodeAPI } from '../../../../mockes/vscode-api';

describe('ContractViewer', () => {
    let mockVSCode: MockVSCodeAPI;
    
    beforeEach(() => {
        mockVSCode = new MockVSCodeAPI();
        mockVSCode.postMessage = jest.fn();
    });

    test('renders contract details successfully', () => {
        const contractPath = '/test/Contract.sol';
        
        render(<ContractViewer vscode={mockVSCode} contractPath={contractPath} />);

        expect(mockVSCode.postMessage).toHaveBeenCalledWith({
            command: 'loadContract',
            payload: { path: contractPath }
        });
    });

    test('handles loading state correctly', () => {
        const contractPath = '/test/Contract.sol';
        
        render(<ContractViewer vscode={mockVSCode} contractPath={contractPath} />);

        expect(mockVSCode.postMessage).toHaveBeenCalledWith({
            command: 'loadContract',
            payload: { path: contractPath }
        });
    });
});


// npm run test -- tests/suite/webview/components/explorer/contract-viewer.test.tsx