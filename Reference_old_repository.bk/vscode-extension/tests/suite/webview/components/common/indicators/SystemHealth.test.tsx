/**
 * @jest-environment jsdom
 */

jest.mock('vscode', () => ({
    window: {
        withProgress: jest.fn((options, task) => task({ report: jest.fn() })),
        showInformationMessage: jest.fn()
    },
    ProgressLocation: { Notification: 1 }
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SystemHealth } from '../../../../../../src/webview/components/common/indicators/SystemHealth';

describe('SystemHealth Component', () => {
    const defaultMetrics = {
        cpu: 45,
        memory: 60,
        latency: 120
    };

    test('displays optimal status correctly', () => {
        render(<SystemHealth status="optimal" metrics={defaultMetrics} />);
        expect(screen.getByText('OPTIMAL')).toBeInTheDocument();
    });

    test('shows correct metric values', () => {
        render(<SystemHealth status="optimal" metrics={defaultMetrics} />);
        expect(screen.getByText('45%')).toBeInTheDocument();
        expect(screen.getByText('60%')).toBeInTheDocument();
        expect(screen.getByText('120ms')).toBeInTheDocument();
    });
});