jest.mock('vscode', () => ({
    window: {
        withProgress: jest.fn((options, task) => task({ report: jest.fn() }))
    },
    ProgressLocation: {
        Notification: 1
    },
    EventEmitter: jest.fn(),
    commands: {
        registerCommand: jest.fn().mockReturnValue({
            dispose: jest.fn()
        })
    },
    Disposable: {
        from: jest.fn().mockReturnValue({
            dispose: jest.fn()
        })
    }
}));

import { describe, expect, test, beforeEach } from '@jest/globals';
import { ExtensionActivator } from '../../../../src/activation';
import { createTestContext } from '../helpers/setup-helper';
import { EnhancedLogger } from '../../../../src/utils/logger';
import * as vscode from 'vscode';

describe('Extension Cleanup', () => {
    let activator: ExtensionActivator;
    let context: vscode.ExtensionContext;
    let mockLogger: jest.Mocked<EnhancedLogger>;

    beforeEach(() => {
        // Setup mock logger
        mockLogger = {
            info: jest.fn(),
            error: jest.fn(),
            debug: jest.fn(),
            logOperation: jest.fn().mockImplementation((_, __, fn) => fn())
        } as any;

        // Create test context
        context = createTestContext();
        
        // Initialize activator with mocked dependencies
        activator = new ExtensionActivator();
        (activator as any).logger = mockLogger;
        
        // Mock the activation steps
        (activator as any).executeActivationStep = jest.fn().mockResolvedValue(undefined);
        (activator as any).initializeServices = jest.fn().mockResolvedValue({
            aiOrchestrator: { dispose: jest.fn() },
            languageHandler: { dispose: jest.fn() },
            securityService: { dispose: jest.fn() }
        });
    });

    test('disposes all resources on deactivation', async () => {
        await activator.activate(context);
        await activator.deactivate();
        expect(mockLogger.info).toHaveBeenCalledWith('Extension deactivated successfully');
    });

    test('cleans up service instances', async () => {
        const mockServices = {
            aiOrchestrator: { dispose: jest.fn() },
            languageHandler: { dispose: jest.fn() },
            securityService: { dispose: jest.fn() }
        };
        
        // Setup mock services before activation
        (activator as any).services = mockServices;
        (activator as any).disposables = Object.values(mockServices);
    
        await activator.activate(context);
        await activator.deactivate();
        
        Object.values(mockServices).forEach(service => {
            expect(service.dispose).toHaveBeenCalled();
        });
    });
    
    

    test('logs cleanup operations', async () => {
        await activator.activate(context);
        await activator.deactivate();
        expect(mockLogger.info).toHaveBeenCalledWith('Starting extension deactivation');
        expect(mockLogger.info).toHaveBeenCalledWith('Extension deactivated successfully');
    });
});

// npm run test:suite -- tests/suite/activation/test-cases/activation-cleanup.test.ts