import { describe, expect, test, beforeEach } from '@jest/globals';
import { SecurityService } from '../../../src/services/security-service';
import { createTestContext } from '../activation/helpers/setup-helper';
import { EnhancedLogger } from '../../../src/utils/logger';

describe('SecurityService', () => {
    let securityService: SecurityService;
    let logger: EnhancedLogger;

    beforeEach(() => {
        const context = createTestContext();
        logger = EnhancedLogger.getInstance();
        securityService = new SecurityService(context, logger);
    });

    test('validates deployment successfully', async () => {
        const logSpy = jest.spyOn(logger, 'info');
        await securityService.validateDeployment();
        expect(logSpy).toHaveBeenCalledWith('Starting deployment security validation');
    });
});