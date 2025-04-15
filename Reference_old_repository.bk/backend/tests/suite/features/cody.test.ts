import { 
    CODY_CONFIG, 
    CodyService,
    codyService 
} from '../../../config/features/cody';
import { BASE_PATHS } from '../../../config/base/paths';
import { SYSTEM_RESOURCES } from '../../../shared/constants/system.constants';
import { MONITORING_STATUS } from '../../../shared/constants/monitoring.constants';
import { ALERT_LEVELS } from '../../../shared/constants/alerts.constants';
import http from 'http';



describe('Cody AI Integration', () => {
    let server: http.Server;

    beforeAll(async () => {
        server = http.createServer((req, res) => {
            if (req.url === '/analyze') {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    analysis: { status: 'completed' },
                    metrics: { performance: 'optimal' },
                    recommendations: ['recommendation1']
                }));
            }
            if (req.url === '/health') {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: 'healthy' }));
            }
        });

        await new Promise<void>(resolve => {
            server.listen(3000, () => resolve());
        });
    });

    afterAll(async () => {
        await new Promise<void>((resolve, reject) => {
            server.close(err => {
                if (err) reject(err);
                else resolve();
            });
        });
    });

    describe('Configuration Validation', () => {
        it('validates API configuration', () => {
            expect(CODY_CONFIG.api.endpoint).toContain('sourcegraph.com');
            expect(CODY_CONFIG.api.version).toMatch(/^\d+\.\d+\.\d+$/);
            expect(CODY_CONFIG.api.timeout).toBeGreaterThan(0);
            expect(CODY_CONFIG.api.retries).toBeGreaterThan(0);
        });

        it('validates integration features', () => {
            const { features } = CODY_CONFIG.integration;
            expect(features.codeAnalysis).toBeDefined();
            expect(features.securityScanning).toBeDefined();
            expect(features.performanceMonitoring).toBeDefined();
        });

        it('validates integration modes', () => {
            const { modes } = CODY_CONFIG.integration;
            expect(modes.interactive).toBeDefined();
            expect(modes.batch).toBeDefined();
            expect(modes.streaming).toBeDefined();
        });

        it('validates integration limits', () => {
            const { limits } = CODY_CONFIG.integration;
            expect(limits.maxRequestSize).toBeGreaterThan(0);
            expect(limits.maxConcurrentRequests).toBeGreaterThan(0);
            expect(limits.maxAnalysisDepth).toBeGreaterThan(0);
        });
    });

    describe('CodyService Integration', () => {
        it('validates singleton instance', () => {
            const instance1 = CodyService.getInstance();
            const instance2 = CodyService.getInstance();
            expect(instance1).toBe(instance2);
        });

        it('validates service initialization', () => {
            expect(codyService).toBeDefined();
            expect(codyService).toBeInstanceOf(CodyService);
        });

        it('performs code analysis with backend integration', async () => {
            const analysis = await codyService.analyzeCode('/test/path');
            expect(analysis).toEqual({
                analysis: { status: 'completed' },
                metrics: { performance: 'optimal' },
                recommendations: ['recommendation1']
            });
        }, 10000);

        it ('validates integration connectivity', async () => {
            const isValid = await codyService.validateIntegration();
            expect(typeof isValid).toBe('boolean');
        }, 10000);


        it('monitors performance with system integration', async () => {
            const performance = await codyService.monitorPerformance();
            expect(performance.status).toBe(MONITORING_STATUS.STATES.ACTIVE);
            expect(performance.metrics.cpu).toBeDefined();
            expect(performance.metrics.memory).toBeDefined();
            expect(performance.alerts.level).toBeDefined();
        });

        it('validates integration connectivity', async () => {
            const isValid = await codyService.validateIntegration();
            expect(typeof isValid).toBe('boolean');
        });
    });

    describe('Path Integration', () => {
        it('validates Cody paths alignment', () => {
            expect(BASE_PATHS.CORE.AI_INTEGRATION.CODY.ROOT).toBeDefined();
            expect(BASE_PATHS.CORE.AI_INTEGRATION.CODY.API_CLIENT).toBeDefined();
        });
    });

    describe('System Resource Integration', () => {
        it('validates system resource alignment', () => {
            expect(SYSTEM_RESOURCES.CPU.MIN_CORES).toBeGreaterThan(0);
            expect(SYSTEM_RESOURCES.MEMORY.MIN_TOTAL).toBeGreaterThan(0);
        });
    });

    describe('Alert Integration', () => {
        it('validates alert level integration', () => {
            expect(ALERT_LEVELS.SEVERITY.INFO).toBeDefined();
            expect(ALERT_LEVELS.SEVERITY.CRITICAL).toBeGreaterThan(
                ALERT_LEVELS.SEVERITY.INFO
            );
        });
    });
});