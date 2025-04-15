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
import { StatusBar } from '../../../../../src/webview/components/layout/StatusBar';


describe('StatusBar Component', () => {
    test('displays correct operational status', () => {
        render(<StatusBar status="operational" />);
        expect(screen.getByText('System Status: OPERATIONAL')).toBeInTheDocument();
    });

    test('displays warning status correctly', () => {
        render(<StatusBar status="warning" />);
        expect(screen.getByText('System Status: WARNING')).toBeInTheDocument();
    });

    test('displays critical status correctly', () => {
        render(<StatusBar status="critical" />);
        expect(screen.getByText('System Status: CRITICAL')).toBeInTheDocument();
    });
});


// npm run test -- tests/suite/webview/components/layout/StatusBar.test.tsx