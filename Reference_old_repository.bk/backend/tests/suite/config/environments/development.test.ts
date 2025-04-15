import { describe, expect, test } from '@jest/globals';
import { DEVELOPMENT_CONFIG, validateDevelopmentConfig } from '../../../../config/environments/development';
import { BASE_PATHS } from '../../../../config/base/paths';
import { API_CONFIG } from '../../../../config/base/api';
import { STORAGE_CONFIG } from '../../../../config/base/storage';
import { join } from 'path';

describe('Development Configuration Tests', () => {
    describe('Environment Settings', () => {
        test('validates environment type', () => {
            expect(DEVELOPMENT_CONFIG.environment).toBe('development');
        });

        test('validates debug settings', () => {
            const { debug } = DEVELOPMENT_CONFIG;
            expect(debug.enabled).toBe(true);
            expect(debug.verboseLogging).toBe(true);
            expect(debug.aiDebug).toBe(true);
        });
    });

    describe('Path Configurations', () => {
        describe('Python Paths', () => {
            test('validates python venv path', () => {
                expect(DEVELOPMENT_CONFIG.paths.python.venvPath).toBe(
                    join(BASE_PATHS.CORE.LANGUAGE_HANDLERS.PYTHON.ROOT, 'venv')
                );
            });

            test('validates metrics service path', () => {
                expect(DEVELOPMENT_CONFIG.paths.python.metricsService).toBe(
                    join(BASE_PATHS.CORE.MONITORING, 'metrics_service.py')
                );
            });

            test('validates hardware service path', () => {
                expect(DEVELOPMENT_CONFIG.paths.python.hardwareService).toBe(
                    join(BASE_PATHS.CORE.MONITORING, 'hardware_service.py')
                );
            });
        });

        describe('TypeScript Paths', () => {
            test('validates services path', () => {
                expect(DEVELOPMENT_CONFIG.paths.typescript.servicesPath).toBe(
                    BASE_PATHS.VSCODE.SRC.SERVICES.ROOT
                );
            });
        });

        describe('Monitoring Paths', () => {
            test('validates monitoring paths integration', () => {
                const { monitoring } = DEVELOPMENT_CONFIG.paths;
                expect(monitoring.logsPath).toBe(STORAGE_CONFIG.persistence.path);
                expect(monitoring.metricsPath).toBe(STORAGE_CONFIG.metrics.paths.raw);
                expect(monitoring.alertsPath).toBe(join(BASE_PATHS.RUNTIME.LOGS, 'alerts'));
            });
        });
    });

    describe('Service Configurations', () => {
        describe('Python Services', () => {
            test('validates metrics collection settings', () => {
                const { metricsCollection } = DEVELOPMENT_CONFIG.services.python;
                expect(metricsCollection.enabled).toBe(true);
                expect(metricsCollection.interval).toBe(API_CONFIG.monitoring.metricsInterval);
                expect(metricsCollection.retention).toBe(STORAGE_CONFIG.cache.retention);
            });

            test('validates hardware monitoring settings', () => {
                const { hardwareMonitoring } = DEVELOPMENT_CONFIG.services.python;
                expect(hardwareMonitoring.enabled).toBe(true);
                expect(hardwareMonitoring.interval).toBe(10000);
                expect(hardwareMonitoring.thresholds).toEqual(API_CONFIG.monitoring.alertThresholds);
            });
        });

        describe('TypeScript Services', () => {
            test('validates metrics processing settings', () => {
                const { metricsProcessing } = DEVELOPMENT_CONFIG.services.typescript;
                expect(metricsProcessing.batchSize).toBe(100);
                expect(metricsProcessing.workerCount).toBe(2);
                expect(metricsProcessing.compression).toBe(true);
            });
        });
    });

    describe('AI Configuration', () => {
        describe('Cody Settings', () => {
            test('validates Cody configuration', () => {
                const { cody } = DEVELOPMENT_CONFIG.ai;
                expect(cody.debug).toBe(true);
                expect(cody.modelPath).toBe(join(BASE_PATHS.CORE.AI_INTEGRATION.CODY.ROOT, 'models'));
                expect(cody.maxTokens).toBe(2048);
                expect(cody.temperature).toBe(0.7);
            });
        });

        describe('Llama Settings', () => {
            test('validates Llama configuration', () => {
                const { llama } = DEVELOPMENT_CONFIG.ai;
                expect(llama.enabled).toBe(true);
                expect(llama.modelConfig.path).toBe(join(BASE_PATHS.CORE.AI_INTEGRATION.ROOT, 'llama_models'));
                expect(llama.modelConfig.quantization).toBe('4bit');
                expect(llama.modelConfig.contextSize).toBe(2048);
            });
        });
    });

    describe('Security Settings', () => {
        test('validates development security settings', () => {
            const { devMode } = DEVELOPMENT_CONFIG.security;
            expect(devMode.allowUnsignedExtensions).toBe(true);
            expect(devMode.disableAuthentication).toBe(true);
            expect(devMode.skipVerification).toBe(true);
        });
    });

    describe('Configuration Validation', () => {
        test('validates complete development configuration', () => {
            expect(validateDevelopmentConfig()).toBe(true);
        });

        test('validates path existence', () => {
            const { paths } = DEVELOPMENT_CONFIG;
            expect(paths.python.venvPath).toBeDefined();
            expect(paths.python.metricsService).toBeDefined();
            expect(paths.typescript.servicesPath).toBeDefined();
            expect(paths.monitoring.logsPath).toBeDefined();
        });

        test('validates service configurations', () => {
            const { services } = DEVELOPMENT_CONFIG;
            expect(services.python.metricsCollection.interval).toBeGreaterThan(0);
            expect(services.python.metricsCollection.retention).toBeGreaterThan(0);
            expect(services.python.hardwareMonitoring.interval).toBeGreaterThan(0);
        });

        test('validates AI configurations', () => {
            const { ai } = DEVELOPMENT_CONFIG;
            expect(ai.cody.maxTokens).toBeGreaterThan(0);
            expect(ai.cody.temperature).toBeGreaterThanOrEqual(0);
            expect(ai.cody.temperature).toBeLessThanOrEqual(1);
            expect(['4bit', '8bit']).toContain(ai.llama.modelConfig.quantization);
        });
    });
});

// npm run test:development