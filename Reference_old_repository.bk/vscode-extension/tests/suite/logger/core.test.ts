import { describe, expect, test, beforeEach, jest } from '@jest/globals';
import type { MockFsModule, LoggerConfig } from '../../../src/utils/logger/types';

// Update mock setup
jest.mock('fs-extra', () => ({
    writeJSON: jest.fn(() => Promise.resolve()),
    readJSON: jest.fn(() => Promise.resolve([])),
    appendFile: jest.fn(() => Promise.resolve()),
    ensureDir: jest.fn(() => Promise.resolve()),
    ensureDirSync: jest.fn(),
    pathExists: jest.fn(() => Promise.resolve(false))
}));


import { BaseLogger } from '../../../src/utils/logger/core';

class TestLogger extends BaseLogger {
    constructor(config: LoggerConfig) {
        super(config);
    }

    public async testLogMetric(category: string, operation: string, metric: any) {
        return this.logMetric(category, operation, metric);
    }

    public getCorrelationId(): string {
        return this.correlationId;
    }
}

describe('BaseLogger', () => {
    let logger: TestLogger;
    let mockFs: MockFsModule;

    beforeEach(() => {
        jest.clearAllMocks();
        mockFs = require('fs-extra');
        logger = new TestLogger({
            logLevel: 'INFO',
            retentionDays: 30,
            metricsEnabled: true
        });
    });

    test('initializes with correct configuration', () => {
        const config = logger.getConfig();
        expect(config.logLevel).toBe('INFO');
        expect(config.retentionDays).toBe(30);
        expect(config.metricsEnabled).toBe(true);
    });

    test('creates required directories', () => {
        expect(mockFs.ensureDirSync).toHaveBeenCalledWith(expect.stringContaining('logs'));
        expect(mockFs.ensureDirSync).toHaveBeenCalledWith(expect.stringContaining('metrics'));
    });

    test('generates unique correlation IDs', () => {
        const logger2 = new TestLogger({
            logLevel: 'INFO',
            retentionDays: 30,
            metricsEnabled: true
        });
        expect(logger.getCorrelationId()).not.toBe(logger2.getCorrelationId());
    });

    test('handles new metric creation', async () => {
        const metric = {
            startTime: Date.now(),
            endTime: Date.now(),
            duration: 100,
            success: true
        };

        await logger.testLogMetric('test', 'new', metric);
        expect(mockFs.writeJSON).toHaveBeenCalledWith(
            expect.stringContaining('test-new'),
            expect.arrayContaining([
                expect.objectContaining({
                    correlationId: expect.any(String),
                    metrics: expect.objectContaining({
                        success: true
                    })
                })
            ]),
            expect.objectContaining({ spaces: 2 })
        );
    });

    test('appends to existing metrics', async () => {
        mockFs.pathExists.mockResolvedValue(true);
        mockFs.readJSON.mockResolvedValue([{ existing: 'metric' }]);

        await logger.testLogMetric('test', 'append', {
            startTime: Date.now(),
            endTime: Date.now(),
            duration: 100,
            success: true
        });

        expect(mockFs.writeJSON).toHaveBeenCalledWith(
            expect.any(String),
            expect.arrayContaining([
                expect.objectContaining({ existing: 'metric' })
            ]),
            expect.anything()
        );
    });

    test('handles metric file read errors', async () => {
        mockFs.pathExists.mockResolvedValue(true);
        mockFs.readJSON.mockRejectedValue(new Error('Read error'));

        await logger.testLogMetric('test', 'error', {
            startTime: Date.now(),
            endTime: Date.now(),
            duration: 100,
            success: true
        });

        expect(mockFs.writeJSON).toHaveBeenCalled();
    });
});




/*
# Test all logger modules
npm run test:suite -- tests/suite/logger/*.test.ts

# Test specific module
npm run test:suite -- tests/suite/logger/core.test.ts
npm run test:suite -- tests/suite/logger/metrics.test.ts
npm run test:suite -- tests/suite/logger/security.test.ts
npm run test:suite -- tests/suite/logger/index.test.ts
*/