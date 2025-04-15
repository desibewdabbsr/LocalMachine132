import { join } from 'path';
import { BASE_PATHS } from './paths';
import { API_CONFIG } from './api';
import { StorageConfig } from '../../types';

interface MetricsStorageConfig {
    storageFormat: 'json' | 'binary';
    compressionLevel: number;
    rotationSize: number;
    retentionPeriod: number;
    paths: {
        raw: string;
        processed: string;
        archived: string;
    };
}

export const STORAGE_CONFIG: StorageConfig = {
    cache: {
        basePath: BASE_PATHS.RUNTIME.CACHE,
        maxSize: 1024 * 1024 * 100,
        retention: 24,
        types: {
            metrics: join(BASE_PATHS.RUNTIME.CACHE, 'metrics'),
            contracts: join(BASE_PATHS.RUNTIME.CACHE, 'contracts'),
            compiler: join(BASE_PATHS.RUNTIME.CACHE, 'compiler'),
            ai: join(BASE_PATHS.RUNTIME.CACHE, 'ai'),
            language: join(BASE_PATHS.RUNTIME.CACHE, 'language')
        }
    },
    persistence: {
        type: 'file',
        path: BASE_PATHS.RUNTIME.METRICS,
        backupInterval: 30,
        formats: {
            metrics: 'json',
            logs: 'json',
            cache: 'binary'
        }
    },
    metrics: {
        storageFormat: 'json',
        compressionLevel: 6,
        rotationSize: 1024 * 1024 * 10,
        retentionPeriod: 24, // hours
        paths: {
            raw: join(BASE_PATHS.RUNTIME.METRICS, 'raw'),
            processed: join(BASE_PATHS.RUNTIME.METRICS, 'processed'),
            archived: join(BASE_PATHS.RUNTIME.METRICS, 'archived')
        }
    },
    apiStorage: {
        endpoints: {
            [API_CONFIG.endpoints.monitoring.metrics]: {
                cacheDuration: 300,
                format: 'json'
            },
            [API_CONFIG.endpoints.ai.ml.train]: {
                cacheDuration: 3600,
                format: 'binary'
            }
        },
        backupPaths: {
            metrics: join(BASE_PATHS.RUNTIME.METRICS, 'api_metrics'),
            cache: join(BASE_PATHS.RUNTIME.CACHE, 'api_responses')
        }
    }
};

export const validateStorageConfig = (): boolean => {
    const { cache, persistence, metrics } = STORAGE_CONFIG;
    
    if (cache.maxSize <= 0 || cache.retention <= 0) {
        return false;
    }

    if (!['file', 'memory'].includes(persistence.type) || 
        persistence.backupInterval <= 0) {
        return false;
    }

    if (!['json', 'binary'].includes(metrics.storageFormat) || 
        metrics.compressionLevel < 1 || 
        metrics.compressionLevel > 9 ||
        metrics.retentionPeriod <= 0) {
        return false;
    }

    return true;
};

export default STORAGE_CONFIG;