import { describe, expect, test } from '@jest/globals';
import { MockVSCodeAPI } from '../mockes/vscode-api';

describe('Jest Setup', () => {
    test('TextEncoder is globally available', () => {
        const encoder = new TextEncoder();
        expect(encoder).toBeInstanceOf(TextEncoder);
        expect(encoder.encode).toBeDefined();
    });

    test('TextDecoder is globally available', () => {
        const decoder = new TextDecoder();
        expect(decoder).toBeInstanceOf(TextDecoder);
        expect(decoder.decode).toBeDefined();
    });

    test('VSCode API mock is properly initialized', () => {
        const api = new MockVSCodeAPI();
        expect(api.getState).toBeDefined();
        expect(api.setState).toBeDefined();
        expect(api.postMessage).toBeDefined();
    });
});


// npm run test -- tests/setup/jest.setup.test.ts