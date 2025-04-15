/**
 * @jest-environment jsdom
 */

// Constants for network testing
const TEST_NETWORK_URL = 'http://127.0.0.1:8545';
const TEST_ACCOUNT = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';

jest.mock('vscode', () => ({
    window: {
        withProgress: jest.fn((options, task) => task({ report: jest.fn() })),
        showInformationMessage: jest.fn()
    },
    ProgressLocation: {
        Notification: 1
    }
}));

const mockFsImplementation = {
    ensureDir: jest.fn().mockResolvedValue(undefined),
    writeJSON: jest.fn().mockResolvedValue(undefined),
    readJSON: jest.fn().mockResolvedValue(undefined),
    readdir: jest.fn().mockResolvedValue([]),
    stat: jest.fn().mockResolvedValue({ size: 1024 }),
    pathExists: jest.fn().mockResolvedValue(false),
    remove: jest.fn().mockResolvedValue(undefined)
};

jest.mock('fs-extra', () => mockFsImplementation);

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

jest.mock('../../../../../src/workflow/build/monitoring/performance-tracker', () => ({
    PerformanceTracker: jest.fn().mockImplementation(() => ({
        initialize: jest.fn().mockResolvedValue(undefined),
        startTracking: jest.fn().mockResolvedValue('test-session'),
        trackOperation: jest.fn().mockImplementation(async (_, fn) => {
            const result = await fn();
            return {
                executionTime: 100,
                memoryUsage: { heapUsed: 1024, heapTotal: 2048 },
                transactionThroughput: 10,
                gasEfficiency: 21000,
                operationSuccess: true,
                timestamp: Date.now(),
                blockRange: { start: 1, end: 10 }
            };
        })
    }))
}));

import { describe, expect, test, beforeEach, afterEach } from '@jest/globals';
import { CacheBackupHandlerOperations } from '../../../../../src/workflow/production/optimization/cache-backup-handler-operations';
import { BackupConfig } from '../../../../../src/workflow/production/optimization/cache-backup-handler-core';
import { EnhancedLogger } from '../../../../../src/utils/logger';
import * as fs from 'fs-extra';

describe('CacheBackupHandlerOperations', () => {
    let backupHandler: CacheBackupHandlerOperations;
    let mockLogger: jest.Mocked<EnhancedLogger>;
    let testConfig: BackupConfig;

    const TEST_SOURCE_PATH = '/test/source';
    const TEST_BACKUP_DIR = '/test/backups';

    beforeEach(() => {
        jest.clearAllMocks();

        mockLogger = {
            info: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
            logOperation: jest.fn().mockImplementation((_, __, fn) => fn())
        } as any;

        const mockNetworkService = {
            connect: jest.fn().mockResolvedValue(undefined),
            validateConnection: jest.fn().mockResolvedValue(true),
            getDefaultAccount: jest.fn().mockResolvedValue(TEST_ACCOUNT)
        };

        testConfig = {
            backupDir: TEST_BACKUP_DIR,
            maxBackups: 5,
            compressionLevel: 6,
            backupInterval: 3600000,
            retentionDays: 7
        };

        backupHandler = new CacheBackupHandlerOperations(
            testConfig,
            TEST_SOURCE_PATH,
            TEST_NETWORK_URL,
            mockNetworkService,
            mockLogger
        );
    });

    afterEach(() => {
        if (backupHandler) {
            backupHandler.dispose();
        }
    });

    describe('Backup Rotation', () => {
        test('rotates backups when limit exceeded', async () => {
            await backupHandler.initialize();
            
            // Setup more than maxBackups (5) files
            mockFsImplementation.readdir.mockResolvedValue([
                'backup-1.zip', 'backup-2.zip', 'backup-3.zip',
                'backup-4.zip', 'backup-5.zip', 'backup-6.zip',
                'backup-7.zip' // Adding one more backup file
            ]);
    
            await backupHandler.rotateBackups();
            
            // Verify that remove was called twice (for 2 oldest backups)
            expect(mockFsImplementation.remove).toHaveBeenCalledTimes(2);
            expect(mockFsImplementation.remove).toHaveBeenCalledWith(
                expect.stringContaining('backup-1.zip')
            );
            expect(mockFsImplementation.remove).toHaveBeenCalledWith(
                expect.stringContaining('backup-2.zip')
            );
        });
    });

    describe('Restore Operations', () => {
        test('restores from valid backup', async () => {
            await backupHandler.initialize();
            const timestamp = Date.now();
            mockFsImplementation.readdir.mockResolvedValue([`backup-${timestamp}.zip`]);
            mockFsImplementation.pathExists.mockResolvedValue(true);

            await expect(backupHandler.restoreFromBackup(timestamp))
                .resolves.not.toThrow();
        });
    });

    describe('Performance Tracking', () => {
        test('tracks performance metrics during operations', async () => {
            await backupHandler.initialize();
            const result = await backupHandler.createBackup();
            
            expect(result.metadata.performance).toEqual(expect.objectContaining({
                executionTime: expect.any(Number),
                memoryUsage: expect.any(Object),
                operationSuccess: true
            }));
        });
    });
});


// npm run test -- tests/suite/workflow/production/optimization/cache-backup-handler-operations.test.ts