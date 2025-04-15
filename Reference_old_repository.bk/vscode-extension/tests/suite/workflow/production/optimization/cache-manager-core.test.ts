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

import { describe, expect, test, beforeEach, afterEach } from '@jest/globals';
import { CacheManagerCore, CacheConfig } from '../../../../../src/workflow/production/optimization/cache-manager-core';
import { NetworkService } from '../../../../../src/services/network/network-service';
import { EnhancedLogger } from '../../../../../src/utils/logger';
import { PerformanceTracker } from '../../../../../src/workflow/build/monitoring/performance-tracker';

describe('CacheManagerCore', () => {
    let cacheManager: CacheManagerCore;
    let mockLogger: jest.Mocked<EnhancedLogger>;
    let mockNetworkService: jest.Mocked<NetworkService>;
    let testConfig: CacheConfig;

    beforeEach(() => {
        process.env.NODE_ENV = 'test';
        jest.clearAllMocks();
    
        // Initialize mockLogger first
        mockLogger = {
            debug: jest.fn(),
            info: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            logOperation: jest.fn().mockImplementation((_, __, fn) => fn())
        } as any;
    
        (EnhancedLogger.getInstance as jest.Mock).mockReturnValue(mockLogger);
    
        testConfig = {
            maxSize: 100,
            ttl: 3600000,
            cleanupInterval: 300000
        };
    
        mockNetworkService = {
            connect: jest.fn().mockResolvedValue(undefined),
            validateConnection: jest.fn().mockResolvedValue(true)
        } as any;
    
        jest.spyOn(PerformanceTracker.prototype, 'initialize')
            .mockImplementation(async () => Promise.resolve());
            
        jest.spyOn(PerformanceTracker.prototype, 'startTracking')
            .mockImplementation(async (operationId: string): Promise<string> => 'test-session-id');
        
        jest.spyOn(PerformanceTracker.prototype, 'trackOperation')
            .mockImplementation(async (sessionId: string, fn: () => Promise<any>) => fn());
    
        cacheManager = new CacheManagerCore(testConfig, mockNetworkService);
    });
    
    
    

    afterEach(() => {
        cacheManager.dispose();
    });

    test('initializes successfully', async () => {
        await cacheManager.initialize();
        expect(mockLogger.info).toHaveBeenCalledWith(
            expect.stringContaining('Cache manager initialized')
        );
    });

    test('caches and retrieves data correctly', async () => {
        await cacheManager.initialize();
        const testData = { test: 'data' };
        
        await cacheManager.set('test-key', testData);
        const retrieved = await cacheManager.get('test-key');
        
        expect(retrieved).toEqual(testData);
    });

    test('handles cache misses', async () => {
        await cacheManager.initialize();
        const result = await cacheManager.get('non-existent');
        expect(result).toBeNull();
    });

    test('respects size limits', async () => {
        await cacheManager.initialize();
        // Use a smaller buffer size that still exceeds maxSize (100MB)
        const largeData = Buffer.alloc(110 * 1024 * 1024); // 110MB
        
        await expect(
            cacheManager.set('large-data', largeData)
        ).rejects.toThrow('Cache entry exceeds maximum size limit');
    });
    

    test('maintains accurate metrics', async () => {
        await cacheManager.initialize();
        
        await cacheManager.set('key1', 'data1');
        await cacheManager.get('key1');
        await cacheManager.get('non-existent');
        
        const metrics = cacheManager.getMetrics();
        expect(metrics.hits).toBe(1);
        expect(metrics.misses).toBe(1);
        expect(metrics.entries).toBe(1);
    });

    test('clears cache correctly', async () => {
        await cacheManager.initialize();
        await cacheManager.set('test-key', 'test-data');
        
        await cacheManager.clear();
        
        const retrieved = await cacheManager.get('test-key');
        expect(retrieved).toBeNull();
        
        const metrics = cacheManager.getMetrics();
        expect(metrics.entries).toBe(0);
        expect(metrics.size).toBe(0);
    });

    test('handles expired entries', async () => {
        testConfig.ttl = 100; // 100ms TTL for testing
        await cacheManager.initialize();
        
        await cacheManager.set('test-key', 'test-data');
        await new Promise(resolve => setTimeout(resolve, 150));
        
        const retrieved = await cacheManager.get('test-key');
        expect(retrieved).toBeNull();
    });
});

// npm run test -- tests/suite/workflow/production/optimization/cache-manager-core.test.ts