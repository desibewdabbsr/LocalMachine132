import * as fs from 'fs-extra';
import * as path from 'path';
import { EnhancedLogger } from '../../../utils/logger';
import { CacheEntry } from './cache-manager-core';

export interface StorageConfig {
    maxSize: number;
    ttl: number;
    cleanupInterval: number;
    storageDir: string;
}

export class CacheStorageManager {
    private logger: EnhancedLogger;
    private isInitialized: boolean = false;

    constructor(
        private readonly config: StorageConfig,
        private readonly storagePath: string
    ) {
        this.logger = EnhancedLogger.getInstance();
    }

// In the initialize method:
async initialize(): Promise<void> {
    return this.logger.logOperation('cache-storage', 'initialize', async () => {
        try {
            await fs.ensureDir(this.storagePath);
            this.isInitialized = true;
            this.logger.info(`Cache storage system initialized - Path: ${this.storagePath}`);
        } catch (error) {
            this.logger.error(`Failed to initialize cache storage: ${error}`);
            throw new Error('Cache storage initialization failed');
        }
    });
}


    async persistEntry<T>(key: string, entry: CacheEntry<T>): Promise<void> {
        return this.logger.logOperation('cache-storage', 'persist-entry', async () => {
            this.validateInitialization();
            try {
                const filePath = this.getFilePath(key);
                await fs.writeJSON(filePath, entry, { spaces: 2 });
                this.logger.debug(`Persisted cache entry: ${key}`);
            } catch (error) {
                this.logger.error(`Failed to persist cache entry ${key}: ${error}`);
                throw error;
            }
        });
    }

    async loadEntry<T>(key: string): Promise<CacheEntry<T> | null> {
        return this.logger.logOperation('cache-storage', 'load-entry', async () => {
            this.validateInitialization();
            try {
                const filePath = this.getFilePath(key);
                
                if (!await fs.pathExists(filePath)) {
                    return null;
                }

                const entry = await fs.readJSON(filePath);
                return this.deserializeEntry<T>(entry);
            } catch (error) {
                this.logger.error(`Failed to load cache entry ${key}: ${error}`);
                return null;
            }
        });
    }

    async removeEntry(key: string): Promise<void> {
        return this.logger.logOperation('cache-storage', 'remove-entry', async () => {
            this.validateInitialization();
            try {
                const filePath = this.getFilePath(key);
                if (await fs.pathExists(filePath)) {
                    await fs.remove(filePath);
                    this.logger.debug(`Removed cache entry: ${key}`);
                }
            } catch (error) {
                this.logger.error(`Failed to remove cache entry ${key}: ${error}`);
                throw error;
            }
        });
    }

    private validateInitialization(): void {
        if (!this.isInitialized) {
            throw new Error('Cache storage manager not initialized');
        }
    }

    private getFilePath(key: string): string {
        return path.join(this.storagePath, `${key}.json`);
    }

    private deserializeEntry<T>(data: any): CacheEntry<T> {
        return {
            ...data,
            timestamp: new Date(data.timestamp).getTime()
        };
    }
}


// npm run test -- tests/suite/workflow/production/optimization/cache-storage-manager.test.ts