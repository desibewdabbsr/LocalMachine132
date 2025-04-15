/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MetricsChart } from '../../../../../../src/webview/components/common/Visualizations/MetricsChart';

describe('MetricsChart Component', () => {
    const mockData = Array.from({ length: 10 }, (_, i) => ({
        timestamp: Date.now() + i * 1000,
        value: Math.random() * 100
    }));

    test('renders canvas element', () => {
        const { container } = render(<MetricsChart data={mockData} />);
        expect(container.querySelector('canvas')).toBeInTheDocument();
    });

    test('applies custom dimensions', () => {
        const { container } = render(
            <MetricsChart 
                data={mockData} 
                width={800} 
                height={400} 
            />
        );
        const canvas = container.querySelector('canvas');
        expect(canvas).toHaveAttribute('width', '800');
        expect(canvas).toHaveAttribute('height', '400');
    });
});