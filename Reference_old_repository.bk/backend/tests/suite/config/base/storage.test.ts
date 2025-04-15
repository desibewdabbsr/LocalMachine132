import { describe, expect, test } from '@jest/globals';
import { STORAGE_CONFIG, validateStorageConfig } from '../../../../config/base/storage';
import { API_CONFIG } from '../../../../config/base/api';
import { BASE_PATHS } from '../../../../config/base/paths';
import { StorageConfig } from '../../../../types';
import { join } from 'path';

describe('Storage Configuration Integration Tests', () => {
    describe('Metrics Storage Integration', () => {
        test('validates metrics format and retention settings', () => {
            const { metrics } = STORAGE_CONFIG;
            expect(metrics.storageFormat).toBe('json');
            expect(metrics.retentionPeriod).toBe(24);
            expect(metrics.compressionLevel).toBeLessThanOrEqual(9);
            expect(metrics.compressionLevel).toBeGreaterThanOrEqual(1);
        });

        test('validates metrics directory structure', () => {
            const { paths } = STORAGE_CONFIG.metrics;
            expect(paths.raw).toBe(join(BASE_PATHS.RUNTIME.METRICS, 'raw'));
            expect(paths.processed).toBe(join(BASE_PATHS.RUNTIME.METRICS, 'processed'));
            expect(paths.archived).toBe(join(BASE_PATHS.RUNTIME.METRICS, 'archived'));
        });

        test('validates metrics retention configuration', () => {
            expect(STORAGE_CONFIG.metrics.retentionPeriod).toBeGreaterThan(0);
            expect(Number.isInteger(STORAGE_CONFIG.metrics.retentionPeriod)).toBe(true);
        });
    });

    describe('Storage-Metrics Integration', () => {
        test('validates metrics storage paths with base configuration', () => {
            const { metrics } = STORAGE_CONFIG;
            Object.values(metrics.paths).forEach(path => {
                expect(path).toContain(BASE_PATHS.RUNTIME.METRICS);
            });
        });

        test('validates metrics rotation and compression settings', () => {
            const { metrics } = STORAGE_CONFIG;
            expect(metrics.rotationSize).toBeGreaterThan(0);
            expect(metrics.compressionLevel).toBeGreaterThan(0);
            expect(metrics.retentionPeriod).toBe(24);
        });
    });

    describe('Cache Integration', () => {
        test('validates cache paths align with API endpoints', () => {
            const { cache } = STORAGE_CONFIG;
            expect(cache.types.metrics).toBe(join(BASE_PATHS.RUNTIME.CACHE, 'metrics'));
            expect(cache.types.contracts).toBe(join(BASE_PATHS.RUNTIME.CACHE, 'contracts'));
        });

        test('validates cache settings for API operations', () => {
            expect(STORAGE_CONFIG.cache.maxSize).toBeGreaterThan(0);
            expect(STORAGE_CONFIG.cache.retention).toBeGreaterThan(0);
        });
    });

    describe('Persistence Integration', () => {
        test('validates persistence path alignment', () => {
            expect(STORAGE_CONFIG.persistence.path).toBe(BASE_PATHS.RUNTIME.METRICS);
        });

        test('validates backup interval for API metrics', () => {
            expect(STORAGE_CONFIG.persistence.backupInterval).toBeGreaterThan(0);
        });
    });

    describe('API Integration Points', () => {
        test('validates API endpoints with storage paths', () => {
            const { monitoring } = API_CONFIG.endpoints;
            expect(monitoring.metrics).toBeDefined();
            expect(monitoring.performance).toBeDefined();
        });

        test('validates storage paths with API config', () => {
            const { paths } = API_CONFIG;
            expect(paths.metrics).toBe(STORAGE_CONFIG.persistence.path);
            expect(paths.cache).toBe(STORAGE_CONFIG.cache.basePath);
        });
    });

    describe('Configuration Validation', () => {
        test('validates complete storage configuration', () => {
            expect(validateStorageConfig()).toBe(true);
        });

        test('validates type safety of storage config', () => {
            const config: StorageConfig = STORAGE_CONFIG;
            expect(config.metrics.retentionPeriod).toBeDefined();
            expect(typeof config.metrics.retentionPeriod).toBe('number');
        });
    });
});