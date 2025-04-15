import {
    MONITORING_INTERVALS,
    MONITORING_METHODS,
    MONITORING_STORAGE,
    MONITORING_STATUS
} from '../../shared/constants/monitoring.constants';

describe('Monitoring Constants', () => {
    describe('MONITORING_INTERVALS', () => {
        it('validates default intervals hierarchy', () => {
            expect(MONITORING_INTERVALS.DEFAULT.COLLECTION)
                .toBeLessThan(MONITORING_INTERVALS.DEFAULT.ANALYSIS);
            expect(MONITORING_INTERVALS.DEFAULT.ANALYSIS)
                .toBeLessThan(MONITORING_INTERVALS.DEFAULT.REPORTING);
        });

        it('validates time windows progression', () => {
            expect(MONITORING_INTERVALS.WINDOWS.SHORT)
                .toBeLessThan(MONITORING_INTERVALS.WINDOWS.MEDIUM);
            expect(MONITORING_INTERVALS.WINDOWS.MEDIUM)
                .toBeLessThan(MONITORING_INTERVALS.WINDOWS.LONG);
        });

        it('validates batch configuration', () => {
            expect(MONITORING_INTERVALS.BATCH.SIZE).toBeGreaterThan(0);
            expect(MONITORING_INTERVALS.BATCH.TIMEOUT).toBeGreaterThan(0);
        });
    });

    describe('MONITORING_METHODS', () => {
        it('validates analysis methods', () => {
            const methods = Object.values(MONITORING_METHODS.ANALYSIS);
            expect(methods).toContain('trending');
            expect(methods).toContain('anomaly');
            expect(methods).toContain('threshold');
            expect(methods).toContain('correlation');
        });

        it('validates collection methods', () => {
            const methods = Object.values(MONITORING_METHODS.COLLECTION);
            expect(methods).toContain('polling');
            expect(methods).toContain('event-driven');
            expect(methods).toContain('hybrid');
        });
    });

    describe('MONITORING_STORAGE', () => {
        it('validates storage formats', () => {
            const formats = Object.values(MONITORING_STORAGE.FORMATS);
            expect(formats).toContain('json');
            expect(formats).toContain('binary');
            expect(formats).toContain('compressed');
        });

        it('validates compression levels', () => {
            expect(MONITORING_STORAGE.COMPRESSION.NONE).toBe(0);
            expect(MONITORING_STORAGE.COMPRESSION.MAX).toBe(9);
            expect(MONITORING_STORAGE.COMPRESSION.BALANCED)
                .toBeLessThan(MONITORING_STORAGE.COMPRESSION.MAX);
        });

        it('validates retention periods', () => {
            expect(MONITORING_STORAGE.RETENTION.RAW)
                .toBeLessThan(MONITORING_STORAGE.RETENTION.AGGREGATED);
            expect(MONITORING_STORAGE.RETENTION.AGGREGATED)
                .toBeLessThan(MONITORING_STORAGE.RETENTION.ARCHIVED);
        });
    });

    describe('MONITORING_STATUS', () => {
        it('validates health scores', () => {
            expect(MONITORING_STATUS.HEALTH.CRITICAL)
                .toBeLessThan(MONITORING_STATUS.HEALTH.WARNING);
            expect(MONITORING_STATUS.HEALTH.WARNING)
                .toBeLessThan(MONITORING_STATUS.HEALTH.GOOD);
            expect(MONITORING_STATUS.HEALTH.GOOD)
                .toBeLessThan(MONITORING_STATUS.HEALTH.OPTIMAL);
        });

        it('validates monitoring states', () => {
            const states = Object.values(MONITORING_STATUS.STATES);
            expect(states).toContain('active');
            expect(states).toContain('paused');
            expect(states).toContain('degraded');
            expect(states).toContain('error');
        });
    });
});