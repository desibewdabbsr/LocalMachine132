jest.mock('vscode', () => ({
    window: {
        withProgress: jest.fn()
    }
}));

import { describe, expect, test, beforeEach } from '@jest/globals';
import { MetricsService } from '../../src/metrics/metrics-service';
import { createTestContext } from './activation/helpers/setup-helper';

describe('Metrics Service', () => {
    let metricsService: MetricsService;

    beforeEach(() => {
        const context = createTestContext();
        metricsService = new MetricsService(context);
    });


    test('tracks operation duration', () => {
        const metric = metricsService.trackOperation('test', 'operation');
        metricsService.completeOperation('test', 'operation', true);
        
        expect(metric.duration).toBeGreaterThan(0);
        expect(metric.success).toBe(true);
    });

    test('maintains separate categories', () => {
        metricsService.trackOperation('category1', 'op1');
        metricsService.trackOperation('category2', 'op2');
        
        const metrics = metricsService.getMetrics();
        expect(metrics.has('category1')).toBe(true);
        expect(metrics.has('category2')).toBe(true);
    });
});


// npm run test:suite -- tests/suite/metrics-services.test.ts