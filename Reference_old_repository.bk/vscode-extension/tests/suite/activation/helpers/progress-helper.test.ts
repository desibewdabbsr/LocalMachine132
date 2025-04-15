// tests/suite/activation/helpers/progress-helper.test.ts
import { describe, expect, test } from '@jest/globals';
import { createProgressReporter } from './progress-helper';

describe('Progress Helper', () => {
    test('creates progress reporter with required properties', () => {
        const { progress, token } = createProgressReporter();
        expect(progress.report).toBeDefined();
        expect(token.isCancellationRequested).toBe(false);
        expect(token.onCancellationRequested).toBeDefined();
    });

    test('progress reporter methods are callable', () => {
        const { progress, token } = createProgressReporter();
        progress.report({ message: 'test' });
        expect(progress.report).toHaveBeenCalled();
    });
});


// npm run test:suite -- tests/suite/activation/helpers/progress-helper.test.ts