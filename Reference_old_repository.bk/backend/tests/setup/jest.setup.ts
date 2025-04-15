// backend/tests/setup/jest.setup.test.ts
import { describe, expect, test } from '@jest/globals';

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
});