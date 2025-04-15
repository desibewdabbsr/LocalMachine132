import { describe, expect, test, beforeEach } from '@jest/globals';
import { TestSuiteRunner, createTestRunner } from './index';

describe('Test Runner Infrastructure', () => {
    let testRunner: TestSuiteRunner;

    beforeEach(() => {
        testRunner = createTestRunner();
    });

    test('initializes test environment correctly', () => {
        expect(testRunner).toBeInstanceOf(TestSuiteRunner);
        expect(process.env.NODE_ENV).toBe('test');
    });

    test('manages test results properly', () => {
        const results = testRunner.getCurrentResults();
        expect(Array.isArray(results)).toBeTruthy();
        expect(results).toHaveLength(0);
    });

    test('emits correct events during execution', async () => {
        const events: string[] = [];
        testRunner.on('testStart', () => events.push('start'));
        testRunner.on('testComplete', () => events.push('complete'));

        await testRunner.run();
        
        expect(events).toEqual(['start', 'complete']);
    });

    // test('handles test suite configuration', () => {
    //     const runner = createTestRunner({ timeout: 30000 });
    //     expect(runner).toBeInstanceOf(TestSuiteRunner);
    // });

    test('handles test suite configuration', () => {
        const runner = createTestRunner({ 
            timeout: 30000,
            parallel: true,
            bail: false,
            reporterOptions: {
                output: 'test-results.json'
            }
        });
        expect(runner).toBeInstanceOf(TestSuiteRunner);
    });
      
});


// npm run test:suite