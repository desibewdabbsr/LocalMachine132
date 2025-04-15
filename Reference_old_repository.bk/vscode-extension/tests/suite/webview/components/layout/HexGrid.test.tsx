import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { HexGrid } from '../../../../../src/webview/components/layout/HexGrid';

describe('HexGrid Component', () => {
    test('renders children correctly', () => {
        const { getByText } = render(
            <HexGrid>
                <div>Test Content</div>
            </HexGrid>
        );
        expect(getByText('Test Content')).toBeInTheDocument();
    });
});


// npm run test -- tests/suite/webview/components/layout/HexGrid.test.tsx