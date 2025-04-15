import {
    ALERT_LEVELS,
    ALERT_THRESHOLDS,
    ALERT_ACTIONS,
    ALERT_SETTINGS
} from '../../shared/constants/alerts.constants';

describe('Alert Constants', () => {
    describe('ALERT_LEVELS', () => {
        it('validates severity levels ordering', () => {
            const { SEVERITY } = ALERT_LEVELS;
            expect(SEVERITY.INFO).toBeLessThan(SEVERITY.LOW);
            expect(SEVERITY.LOW).toBeLessThan(SEVERITY.MEDIUM);
            expect(SEVERITY.MEDIUM).toBeLessThan(SEVERITY.HIGH);
            expect(SEVERITY.HIGH).toBeLessThan(SEVERITY.CRITICAL);
        });

        it('validates priority levels ordering', () => {
            const { PRIORITY } = ALERT_LEVELS;
            expect(PRIORITY.ROUTINE).toBeLessThan(PRIORITY.IMPORTANT);
            expect(PRIORITY.IMPORTANT).toBeLessThan(PRIORITY.URGENT);
            expect(PRIORITY.URGENT).toBeLessThan(PRIORITY.EMERGENCY);
        });
    });

    describe('ALERT_THRESHOLDS', () => {
        describe('System Thresholds', () => {
            it('validates CPU thresholds', () => {
                const { CPU_USAGE } = ALERT_THRESHOLDS.SYSTEM;
                expect(CPU_USAGE.WARNING).toBeLessThan(CPU_USAGE.CRITICAL);
                expect(CPU_USAGE.CRITICAL).toBeLessThanOrEqual(100);
                expect(CPU_USAGE.DURATION).toBeGreaterThan(0);
            });

            it('validates memory thresholds', () => {
                const { MEMORY_USAGE } = ALERT_THRESHOLDS.SYSTEM;
                expect(MEMORY_USAGE.WARNING).toBeLessThan(MEMORY_USAGE.CRITICAL);
                expect(MEMORY_USAGE.MIN_FREE).toBeGreaterThan(0);
            });

            it('validates network thresholds', () => {
                const { NETWORK } = ALERT_THRESHOLDS.SYSTEM;
                expect(NETWORK.LATENCY.WARNING).toBeLessThan(NETWORK.LATENCY.CRITICAL);
                expect(NETWORK.PACKET_LOSS.WARNING).toBeLessThan(NETWORK.PACKET_LOSS.CRITICAL);
            });
        });

        describe('Performance Thresholds', () => {
            it('validates response time thresholds', () => {
                const { RESPONSE_TIME } = ALERT_THRESHOLDS.PERFORMANCE;
                expect(RESPONSE_TIME.WARNING).toBeLessThan(RESPONSE_TIME.CRITICAL);
            });

            it('validates error rate thresholds', () => {
                const { ERROR_RATE } = ALERT_THRESHOLDS.PERFORMANCE;
                expect(ERROR_RATE.WARNING).toBeLessThan(ERROR_RATE.CRITICAL);
                expect(ERROR_RATE.CRITICAL).toBeLessThanOrEqual(100);
            });
        });
    });

    describe('ALERT_ACTIONS', () => {
        it('validates notification channels', () => {
            const channels = Object.values(ALERT_ACTIONS.NOTIFICATION);
            expect(channels).toContain('email');
            expect(channels).toContain('slack');
            expect(channels).toContain('webhook');
            expect(channels).toContain('sms');
        });

        it('validates response actions', () => {
            const actions = Object.values(ALERT_ACTIONS.RESPONSE);
            expect(actions).toContain('log');
            expect(actions).toContain('restart');
            expect(actions).toContain('scale');
            expect(actions).toContain('failover');
        });

        it('validates status transitions', () => {
            const statuses = Object.values(ALERT_ACTIONS.STATUS);
            expect(statuses).toContain('new');
            expect(statuses).toContain('acknowledged');
            expect(statuses).toContain('resolved');
        });
    });

    describe('ALERT_SETTINGS', () => {
        it('validates intervals', () => {
            const { INTERVALS } = ALERT_SETTINGS;
            expect(INTERVALS.CHECK).toBeLessThan(INTERVALS.CLEANUP);
            expect(INTERVALS.CLEANUP).toBeLessThan(INTERVALS.RETENTION);
        });

        it('validates batch settings', () => {
            const { BATCH } = ALERT_SETTINGS;
            expect(BATCH.SIZE).toBeGreaterThan(0);
            expect(BATCH.TIMEOUT).toBeGreaterThan(0);
        });

        it('validates aggregation settings', () => {
            const { AGGREGATION } = ALERT_SETTINGS;
            expect(AGGREGATION.TIME_WINDOW).toBeGreaterThan(0);
            expect(AGGREGATION.MAX_SIMILAR).toBeGreaterThan(0);
        });
    });
});