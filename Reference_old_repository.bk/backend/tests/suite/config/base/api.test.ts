import { API_CONFIG, validateAPIConfig } from '../../../../config/base/api';
import { BASE_PATHS } from '../../../../config/base/paths';
import { join } from 'path';

describe('API Configuration Tests', () => {
    describe('Core API Structure', () => {
        test('validates base API configuration', () => {
            expect(API_CONFIG.version).toBe('v1');
            expect(API_CONFIG.baseUrl).toBe('/api/v1');
        });

        test('validates AI endpoints structure', () => {
            const { ai } = API_CONFIG.endpoints;
            expect(ai.cody.analyze).toBe('/ai/cody/analyze');
            expect(ai.ml.train).toBe('/ai/ml/train');
            expect(ai.generators.contract).toBe('/ai/generators/contract');
        });

        test('validates language handler endpoints', () => {
            const { languages } = API_CONFIG.endpoints;
            expect(languages.nodejs.setup).toBe('/lang/nodejs/setup');
            expect(languages.python.venv).toBe('/lang/python/venv');
            expect(languages.rust.cargo).toBe('/lang/rust/cargo');
            expect(languages.solidity.hardhat.config).toBe('/lang/solidity/hardhat/config');
        });
    });

    describe('Security Configuration', () => {
        test('validates rate limiting settings', () => {
            const { rateLimiting } = API_CONFIG.security;
            expect(rateLimiting.maxRequests).toBeGreaterThan(0);
            expect(rateLimiting.windowMs).toBe(15 * 60 * 1000);
            expect(rateLimiting.allowedOverage).toBeGreaterThan(0);
        });

        test('validates CORS configuration', () => {
            const { cors } = API_CONFIG.security;
            expect(cors.allowedOrigins).toContain('http://localhost:3000');
            expect(cors.methods).toContain('GET');
            expect(cors.headers).toContain('Authorization');
        });

        test('validates authentication settings', () => {
            const { authentication } = API_CONFIG.security;
            expect(authentication.tokenExpiry).toBe(24 * 60 * 60);
            expect(authentication.refreshEnabled).toBe(true);
        });
    });

    describe('Monitoring Integration', () => {
        test('validates monitoring thresholds', () => {
            const { alertThresholds } = API_CONFIG.monitoring;
            expect(alertThresholds.cpu).toBeLessThanOrEqual(100);
            expect(alertThresholds.memory).toBeLessThanOrEqual(100);
            expect(alertThresholds.gpu).toBeLessThanOrEqual(100);
        });

        test('validates logging configuration', () => {
            const { logging } = API_CONFIG.monitoring;
            expect(logging.level).toBe('info');
            expect(logging.format).toBe('json');
            expect(logging.rotation).toBe('1d');
        });
    });

    describe('Path Integration', () => {
        test('validates runtime paths', () => {
            const { paths } = API_CONFIG;
            expect(paths.logs).toBe(BASE_PATHS.RUNTIME.LOGS);
            expect(paths.metrics).toBe(BASE_PATHS.RUNTIME.METRICS);
            expect(paths.cache).toBe(BASE_PATHS.RUNTIME.CACHE);
        });

        test('validates model and contract paths', () => {
            const { paths } = API_CONFIG;
            expect(paths.models).toBe(join(BASE_PATHS.ROOT, 'models'));
            expect(paths.contracts).toBe(join(BASE_PATHS.ROOT, 'contracts'));
        });
    });

    describe('Configuration Validation', () => {
        test('validates complete API configuration', () => {
            expect(validateAPIConfig()).toBe(true);
        });

        test('validates endpoint patterns', () => {
            const { endpoints } = API_CONFIG;
            Object.values(endpoints.ai).forEach(category => {
                Object.values(category).forEach(endpoint => {
                    if (typeof endpoint === 'string') {
                        expect(endpoint.startsWith('/')).toBe(true);
                    }
                });
            });
        });

        test('validates integration with language handlers', () => {
            const { languages } = API_CONFIG.endpoints;
            expect(languages.nodejs.toolchain).toBe('/lang/nodejs/toolchain');
            expect(languages.python.packages).toBe('/lang/python/packages');
            expect(languages.rust.toolchain).toBe('/lang/rust/toolchain');
        });

        test('validates integration with monitoring system', () => {
            const { monitoring } = API_CONFIG.endpoints;
            expect(monitoring.metrics).toBe('/monitoring/metrics');
            expect(monitoring.performance).toBe('/monitoring/performance');
            expect(monitoring.security).toBe('/monitoring/security');
        });
    });

    describe('Error Handling', () => {
        test('handles invalid endpoint configurations', () => {
            const invalidConfig = { ...API_CONFIG };
            invalidConfig.endpoints.ai.cody.analyze = 'invalid-path';
            expect(validateAPIConfig.call({ API_CONFIG: invalidConfig })).toBe(false);
        });

        test('handles invalid security settings', () => {
            const invalidConfig = { ...API_CONFIG };
            invalidConfig.security.rateLimiting.maxRequests = -1;
            expect(validateAPIConfig.call({ API_CONFIG: invalidConfig })).toBe(false);
        });

        test('handles invalid monitoring thresholds', () => {
            const invalidConfig = { ...API_CONFIG };
            invalidConfig.monitoring.alertThresholds.cpu = 101;
            expect(validateAPIConfig.call({ API_CONFIG: invalidConfig })).toBe(false);
        });
    });
});