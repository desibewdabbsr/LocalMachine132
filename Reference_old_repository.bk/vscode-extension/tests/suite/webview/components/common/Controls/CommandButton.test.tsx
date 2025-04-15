/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CommandButton } from '../../../../../../src/webview/components/common/Controls/CommandButton';

describe('CommandButton Component', () => {
    test('renders with default props', () => {
        render(<CommandButton label="Execute" />);
        expect(screen.getByText('Execute')).toBeInTheDocument();
    });

    test('handles click events', () => {
        const handleClick = jest.fn();
        render(<CommandButton label="Execute" onClick={handleClick} />);
        
        fireEvent.click(screen.getByRole('button'));
        expect(handleClick).toHaveBeenCalled();
    });

    test('applies variant styles correctly', () => {
        render(<CommandButton label="Warning" variant="warning" />);
        const button = screen.getByRole('button');
        expect(button).toHaveClass('command-button', 'warning');
    });

    test('shows active state indicator', () => {
        render(<CommandButton label="Active" isActive={true} />);
        const button = screen.getByRole('button');
        expect(button).toHaveClass('active');
    });
});


// npm run test -- tests/suite/webview/components/common/Controls/CommandButton.test.tsx