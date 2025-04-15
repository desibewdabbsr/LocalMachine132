import {
    METRICS_INTERVALS,
    METRICS_THRESHOLDS,
    METRICS_FORMATS,
    METRICS_PRIORITIES
} from '../../shared/constants/metrics.constants';

describe('Metrics Constants', () => {
    describe('METRICS_INTERVALS', () => {
        it('validates collection intervals', () => {
            expect(METRICS_INTERVALS.COLLECTION.MINIMUM).toBeLessThan(METRICS_INTERVALS.COLLECTION.DEFAULT);
            expect(METRICS_INTERVALS.COLLECTION.DEFAULT).toBeLessThan(METRICS_INTERVALS.COLLECTION.MAXIMUM);
            expect(METRICS_INTERVALS.COLLECTION.MINIMUM).toBeGreaterThan(0);
        });

        it('validates batch settings', () => {
            expect(METRICS_INTERVALS.BATCH.SIZE).toBeGreaterThan(0);
            expect(METRICS_INTERVALS.BATCH.TIMEOUT).toBeGreaterThan(METRICS_INTERVALS.COLLECTION.DEFAULT);
        });

        it('validates retention settings', () => {
            expect(METRICS_INTERVALS.RETENTION.DAYS).toBeGreaterThan(0);
            expect(METRICS_INTERVALS.RETENTION.MAX_FILE_SIZE).toBeGreaterThan(0);
        });
    });

    describe('METRICS_THRESHOLDS', () => {
        it('validates CPU thresholds', () => {
            expect(METRICS_THRESHOLDS.CPU.WARNING).toBeLessThan(METRICS_THRESHOLDS.CPU.CRITICAL);
            expect(METRICS_THRESHOLDS.CPU.CRITICAL).toBeLessThanOrEqual(100);
            expect(METRICS_THRESHOLDS.CPU.SAMPLING_RATE).toBeGreaterThan(0);
        });

        it('validates memory thresholds', () => {
            expect(METRICS_THRESHOLDS.MEMORY.WARNING).toBeLessThan(METRICS_THRESHOLDS.MEMORY.CRITICAL);
            expect(METRICS_THRESHOLDS.MEMORY.MIN_FREE).toBeGreaterThan(0);
        });

        it('validates disk thresholds', () => {
            expect(METRICS_THRESHOLDS.DISK.WARNING).toBeLessThan(METRICS_THRESHOLDS.DISK.CRITICAL);
            expect(METRICS_THRESHOLDS.DISK.MIN_FREE).toBeGreaterThan(METRICS_THRESHOLDS.MEMORY.MIN_FREE);
        });

        it('validates network thresholds', () => {
            expect(METRICS_THRESHOLDS.NETWORK.LATENCY_WARNING)
                .toBeLessThan(METRICS_THRESHOLDS.NETWORK.LATENCY_CRITICAL);
            expect(METRICS_THRESHOLDS.NETWORK.PACKET_LOSS_WARNING)
                .toBeLessThan(METRICS_THRESHOLDS.NETWORK.PACKET_LOSS_CRITICAL);
        });
    });

    describe('METRICS_FORMATS', () => {
        it('validates available formats', () => {
            expect(Object.values(METRICS_FORMATS)).toContain('json');
            expect(Object.values(METRICS_FORMATS)).toContain('binary');
            expect(Object.values(METRICS_FORMATS)).toContain('compressed');
        });
    });

    describe('METRICS_PRIORITIES', () => {
        it('validates priority ordering', () => {
            expect(METRICS_PRIORITIES.REALTIME).toBeLessThan(METRICS_PRIORITIES.HIGH);
            expect(METRICS_PRIORITIES.HIGH).toBeLessThan(METRICS_PRIORITIES.NORMAL);
            expect(METRICS_PRIORITIES.NORMAL).toBeLessThan(METRICS_PRIORITIES.LOW);
        });
    });
});