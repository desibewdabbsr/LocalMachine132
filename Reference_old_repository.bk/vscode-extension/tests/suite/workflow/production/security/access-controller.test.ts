/**
 * @jest-environment jsdom
 */

jest.mock('vscode', () => ({
    window: {
        withProgress: jest.fn().mockImplementation(function(options: any, task: any) {
            return Promise.resolve(task({ report: jest.fn() }));
        }),
        showErrorMessage: jest.fn().mockImplementation(() => Promise.resolve('View Details'))
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
            logOperation: jest.fn().mockImplementation(function(...args: any[]) {
                const fn = args[2];
                return Promise.resolve(fn());
            })
        })
    }
}));

jest.mock('../../../../../src/workflow/build/monitoring/performance-tracker', () => ({
    PerformanceTracker: jest.fn().mockImplementation(() => ({
        initialize: jest.fn().mockImplementation(() => Promise.resolve()),
        startTracking: jest.fn().mockImplementation(() => Promise.resolve('test-session')),
        trackOperation: jest.fn().mockImplementation(function(...args: any[]) {
            const fn = args[1];
            return Promise.resolve(fn());
        })
    }))
}));

import { describe, expect, test, beforeEach, jest } from '@jest/globals';
import { AccessController, AccessControlConfig, AccessRequest } from '../../../../../src/workflow/production/security/access-controller';
import { EnhancedLogger } from '../../../../../src/utils/logger';
import * as vscode from 'vscode';

describe('AccessController', () => {
    let controller: AccessController;
    let mockLogger: jest.Mocked<EnhancedLogger>;
    let mockNetworkService: {
        connect: jest.Mock;
        validateConnection: jest.Mock;
    };
    let testConfig: AccessControlConfig;
    const TEST_NETWORK_URL = 'http://127.0.0.1:8545';

    beforeEach(() => {
        jest.clearAllMocks();
        
        mockNetworkService = {
            connect: jest.fn().mockImplementation(() => Promise.resolve('connected')),
            validateConnection: jest.fn().mockImplementation(() => Promise.resolve(true))
        };

        testConfig = {
            roles: {
                admin: ['admin1'],
                developer: ['dev1'],
                auditor: ['audit1']
            },
            permissions: {
                contractDeployment: ['admin', 'developer'],
                resourceManagement: ['admin'],
                securityAudit: ['admin', 'auditor']
            },
            enforcementLevel: 'strict',
            auditLogging: true
        };

        mockLogger = (EnhancedLogger.getInstance() as jest.Mocked<EnhancedLogger>);
        controller = new AccessController(testConfig, TEST_NETWORK_URL, mockNetworkService);
    });

    test('initializes successfully', async () => {
        await controller.initialize();
        expect(mockLogger.info).toHaveBeenCalledWith(
            'Access controller initialized successfully'
        );
    });

    test('validates configuration during initialization', async () => {
        const invalidConfig = {
            ...testConfig,
            enforcementLevel: 'invalid'
        };

        const invalidController = new AccessController(
            invalidConfig as AccessControlConfig,
            TEST_NETWORK_URL,
            mockNetworkService
        );

        await expect(invalidController.initialize())
            .rejects.toThrow('Invalid enforcement level');
    });

    test('prevents access checks before initialization', async () => {
        const testRequest: AccessRequest = {
            userId: 'test-user',
            resource: 'contract-deployment',
            action: 'execute',
            context: {
                timestamp: Date.now(),
                environment: 'development',
                metadata: {}
            }
        };

        await expect(controller.checkAccess(testRequest))
            .rejects.toThrow('Access controller not initialized');
    });

    test('processes valid access request successfully', async () => {
        await controller.initialize();
        
        const validRequest: AccessRequest = {
            userId: 'admin1',
            resource: 'contractDeployment',  // This should match exactly
            action: 'execute',
            context: {
                timestamp: Date.now(),
                environment: 'production',
                metadata: {}
            }
        };
    
        const response = await controller.checkAccess(validRequest);
        expect(response.granted).toBe(true);
        expect(response.auditLog).toBeDefined();
    });
    

    test('handles invalid access requests correctly', async () => {
        await controller.initialize();
        
        const invalidRequest: AccessRequest = {
            userId: '',  // Invalid: empty userId
            resource: 'contract-deployment',
            action: 'execute',
            context: {
                timestamp: Date.now(),
                environment: 'production',
                metadata: {}
            }
        };

        await expect(controller.checkAccess(invalidRequest))
            .rejects.toThrow('Invalid access request format');
    });

    test('maintains audit logs correctly', async () => {
        await controller.initialize();
        
        const testRequest: AccessRequest = {
            userId: 'test-user',
            resource: 'test-resource',
            action: 'read',
            context: {
                timestamp: Date.now(),
                environment: 'test',
                metadata: {}
            }
        };

        await controller.checkAccess(testRequest);
        expect(controller.getAccessLogs()).toHaveLength(1);
        
        controller.clearAccessLogs();
        expect(controller.getAccessLogs()).toHaveLength(0);
    });

    test('enforces security policies based on enforcement level', async () => {
        await controller.initialize();
        
        // Test strict enforcement
        const strictRequest: AccessRequest = {
            userId: 'unauthorized-user',
            resource: 'sensitive-resource',
            action: 'write',
            context: {
                timestamp: Date.now(),
                environment: 'production',
                metadata: {}
            }
        };

        const response = await controller.checkAccess(strictRequest);
        expect(response.granted).toBe(false);
        expect(response.reason).toContain('Access denied');
    });
});


// npm run test -- tests/suite/workflow/production/security/access-controller.test.ts