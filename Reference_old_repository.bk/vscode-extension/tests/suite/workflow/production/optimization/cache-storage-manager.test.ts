/**
 * @jest-environment jsdom
 */

jest.mock('vscode', () => ({
    window: {
        withProgress: jest.fn((options, task) => task({ report: jest.fn() })),
        showInformationMessage: jest.fn()
    },
    ProgressLocation: {
        Notification: 1
    }
}));

jest.mock('fs-extra', () => ({
    ensureDir: jest.fn().mockResolvedValue(undefined),
    writeJSON: jest.fn().mockResolvedValue(undefined),
    readJSON: jest.fn().mockResolvedValue(undefined),
    pathExists: jest.fn().mockResolvedValue(false),
    remove: jest.fn().mockResolvedValue(undefined)
}));

jest.mock('../../../../../src/utils/logger', () => ({
    EnhancedLogger: {
        getInstance: jest.fn().mockReturnValue({
            info: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
            logOperation: jest.fn().mockImplementation((_, __, fn) => fn())
        })
    }
}));

import { describe, expect, test, beforeEach } from '@jest/globals';
import { CacheStorageManager, StorageConfig } from '../../../../../src/workflow/production/optimization/cache-storage-manager';
import { CacheEntry } from '../../../../../src/workflow/production/optimization/cache-manager-core';
import { EnhancedLogger } from '../../../../../src/utils/logger';
import * as fs from 'fs-extra';
import * as path from 'path';

describe('CacheStorageManager', () => {
    let storage: CacheStorageManager;
    let mockLogger: jest.Mocked<EnhancedLogger>;
    let testConfig: StorageConfig;
    const TEST_STORAGE_PATH = '/test/storage/path';

    beforeEach(() => {
        jest.clearAllMocks();
        
        testConfig = {
            maxSize: 100,
            ttl: 3600000,
            cleanupInterval: 300000,
            storageDir: TEST_STORAGE_PATH
        };

        mockLogger = {
            debug: jest.fn(),
            info: jest.fn(),
            error: jest.fn(),
            logOperation: jest.fn().mockImplementation(async (_, __, fn) => fn())
        } as any;

        (EnhancedLogger.getInstance as jest.Mock).mockReturnValue(mockLogger);
        storage = new CacheStorageManager(testConfig, TEST_STORAGE_PATH);
    });

    test('initializes successfully', async () => {
        await storage.initialize();
        expect(fs.ensureDir).toHaveBeenCalledWith(TEST_STORAGE_PATH);
        expect(mockLogger.info).toHaveBeenCalledWith(
            `Cache storage system initialized - Path: ${TEST_STORAGE_PATH}`
        );
    });
    

    test('persists cache entry correctly', async () => {
        await storage.initialize();
        const testEntry: CacheEntry<{ test: string }> = {
            key: 'test-key',
            data: { test: 'data' },
            timestamp: Date.now(),
            size: 100
        };

        await storage.persistEntry('test-key', testEntry);
        expect(fs.writeJSON).toHaveBeenCalledWith(
            expect.stringContaining('test-key'),
            testEntry,
            { spaces: 2 }
        );
    });

    test('loads persisted entry successfully', async () => {
        await storage.initialize();
        const testEntry: CacheEntry<{ test: string }> = {
            key: 'test-key',
            data: { test: 'data' },
            timestamp: Date.now(),
            size: 100
        };

        (fs.pathExists as jest.Mock).mockResolvedValue(true);
        (fs.readJSON as jest.Mock).mockResolvedValue(testEntry);

        const loadedEntry = await storage.loadEntry('test-key');
        expect(loadedEntry).toEqual(testEntry);
    });

    test('handles missing entry gracefully', async () => {
        await storage.initialize();
        (fs.pathExists as jest.Mock).mockResolvedValue(false);

        const result = await storage.loadEntry('non-existent');
        expect(result).toBeNull();
    });

    test('removes entry successfully', async () => {
        await storage.initialize();
        (fs.pathExists as jest.Mock).mockResolvedValue(true);

        await storage.removeEntry('test-key');
        expect(fs.remove).toHaveBeenCalledWith(
            expect.stringContaining('test-key')
        );
    });

    test('prevents operations before initialization', async () => {
        await expect(
            storage.persistEntry('test', {} as CacheEntry<any>)
        ).rejects.toThrow('Cache storage manager not initialized');
    });
});


// npm run test -- tests/suite/workflow/production/optimization/cache-storage-manager.test.ts