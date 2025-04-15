import { describe, expect, test, beforeEach, jest } from '@jest/globals';
import { EnhancedLogger } from '../../../src/utils/logger';
import type { MockFsModule } from '../../../src/utils/logger/types';

jest.mock('fs-extra', () => ({
    writeJSON: jest.fn(() => Promise.resolve()),
    readJSON: jest.fn(() => Promise.resolve([])),
    appendFile: jest.fn(() => Promise.resolve()),
    ensureDir: jest.fn(() => Promise.resolve()),
    ensureDirSync: jest.fn()
}));

describe('EnhancedLogger', () => {
    let logger: EnhancedLogger;
    let mockFs: MockFsModule;

    beforeEach(() => {
        jest.clearAllMocks();
        mockFs = require('fs-extra');
        logger = EnhancedLogger.getInstance();
    });

    test('maintains singleton instance', () => {
        const logger2 = EnhancedLogger.getInstance();
        expect(logger).toBe(logger2);
    });

    test('logs messages at different levels', async () => {
        await logger.info('test info');
        await logger.warn('test warn');
        await logger.error('test error');
        await logger.debug('test debug');

        expect(mockFs.appendFile).toHaveBeenCalledTimes(4);
    });

    test('includes required log entry fields', async () => {
        await logger.info('test message');
        
        expect(mockFs.appendFile).toHaveBeenCalledWith(
            expect.any(String),
            expect.stringContaining('"level":"INFO"')
        );
    });

    test('handles async operations', async () => {
        const result = await logger.logOperation('test', 'operation', async () => 'result');
        expect(result).toBe('result');
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