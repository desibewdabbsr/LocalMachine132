import { describe, expect, test, beforeEach, jest } from '@jest/globals';
import type { SecurityAudit, MockFsModule } from '../../../src/utils/logger/types';

// Mock setup before imports
jest.mock('fs-extra', () => ({
    writeJSON: jest.fn(() => Promise.resolve()),
    readJSON: jest.fn(() => Promise.resolve([])),
    appendFile: jest.fn(() => Promise.resolve()),
    ensureDir: jest.fn(() => Promise.resolve()),
    ensureDirSync: jest.fn()
}));

// Import after mock setup
import { SecurityLogger } from '../../../src/utils/logger/security';

describe('SecurityLogger', () => {
    let logger: SecurityLogger;
    let mockFs: MockFsModule;

    beforeEach(() => {
        jest.clearAllMocks();
        mockFs = require('fs-extra');
        logger = new SecurityLogger({
            logLevel: 'INFO',
            retentionDays: 30,
            metricsEnabled: true
        });
    });

    test('logs security audits', async () => {
        const auditEntry: SecurityAudit = {
            action: 'test',
            resource: 'testResource',
            outcome: 'success',
            risk: 'LOW'
        };
        await logger.logSecurityAudit(auditEntry);
        expect(mockFs.appendFile).toHaveBeenCalledWith(
            expect.stringContaining('audit-'),
            expect.stringContaining('"action":"test"')
        );
    });

    test('handles high-risk security events', async () => {
        const highRiskAudit: SecurityAudit = {
            action: 'unauthorized_access',
            resource: 'sensitive_data',
            outcome: 'blocked',
            risk: 'HIGH'
        };
        await logger.logSecurityAudit(highRiskAudit);
        expect(mockFs.appendFile).toHaveBeenCalledWith(
            expect.stringContaining('audit-'),
            expect.stringContaining('"risk":"HIGH"')
        );
    });


    test('tracks security metrics', async () => {
        const securityOperation = async () => {
            await logger.logSecurityAudit({
                action: 'scan',
                resource: 'codebase',
                outcome: 'completed',
                risk: 'LOW'
            });
            return 'scan complete';
        };

        const result = await logger.logOperation('security', 'scan', securityOperation);
        expect(result).toBe('scan complete');
        expect(mockFs.appendFile).toHaveBeenCalled();
    });

    test('maintains audit log structure', async () => {
        const auditEntry: SecurityAudit = {
            action: 'test',
            resource: 'testResource',
            outcome: 'success',
            risk: 'MEDIUM'
        };
        await logger.logSecurityAudit(auditEntry);
        expect(mockFs.appendFile).toHaveBeenCalledWith(
            expect.stringContaining('security-audit-'),
            expect.stringContaining('"action":"test"')
        );
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