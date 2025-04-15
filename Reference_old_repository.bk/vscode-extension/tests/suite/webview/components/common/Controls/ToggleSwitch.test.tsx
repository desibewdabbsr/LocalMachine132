/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ToggleSwitch } from '../../../../../../src/webview/components/common/Controls/ToggleSwitch';

describe('ToggleSwitch Component', () => {
    test('renders with initial state', () => {
        render(<ToggleSwitch isOn={false} onChange={() => {}} label="Test Toggle" />);
        expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
    });

    test('handles state changes', () => {
        const handleChange = jest.fn();
        render(<ToggleSwitch isOn={false} onChange={handleChange} />);
        
        fireEvent.click(screen.getByRole('switch'));
        expect(handleChange).toHaveBeenCalledWith(true);
    });
});