/**
 * @jest-environment jsdom
 */

jest.mock('vscode', () => ({
    window: {
        withProgress: jest.fn((options, task) => task({ 
            report: jest.fn() 
        })),
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
            logOperation: jest.fn().mockImplementation((_, __, fn) => fn()),
            getConfig: jest.fn().mockReturnValue({
                logLevel: 'INFO',
                mode: 'development'
            })
        })
    }
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CommandCenter } from '../../../../../src/webview/components/layout/CommandCenter';

describe('CommandCenter Component', () => {
    test('renders with operational status by default', () => {
        render(<CommandCenter>Test Content</CommandCenter>);
        
        expect(screen.getByText('COMMAND CENTER')).toBeInTheDocument();
        expect(document.querySelector('.status-indicator.operational')).toBeInTheDocument();
    });

    test('displays warning status correctly', () => {
        render(<CommandCenter systemStatus="warning">Test Content</CommandCenter>);
        
        expect(document.querySelector('.status-indicator.warning')).toBeInTheDocument();
    });

    test('renders children content', () => {
        render(
            <CommandCenter>
                <div data-testid="test-content">Child Content</div>
            </CommandCenter>
        );
        
        expect(screen.getByTestId('test-content')).toBeInTheDocument();
    });

    test('handles critical system status', () => {
        render(<CommandCenter systemStatus="critical">Test Content</CommandCenter>);
        
        expect(document.querySelector('.status-indicator.critical')).toBeInTheDocument();
    });
});