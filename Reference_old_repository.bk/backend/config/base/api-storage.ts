import { StorageConfig } from '../../types';  // Import from types.ts
import { APIConfig } from './api';

export interface APIStorageIntegration {
    storage: StorageConfig;
    api: APIConfig;
    integrationPoints: {
        cache: {
            endpoints: string[];
            maxSize: number;
            retention: number;
        };
        metrics: {
            endpoints: string[];
            format: 'json' | 'binary';
            compression: number;
        };
        persistence: {
            paths: string[];
            backupSchedule: number;
        };
    };
}