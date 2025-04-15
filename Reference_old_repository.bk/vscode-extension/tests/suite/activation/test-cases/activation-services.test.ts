jest.mock('vscode', () => ({
    window: {
        withProgress: jest.fn((options, task) => task({ report: jest.fn() }))
    },
    ProgressLocation: {
        Notification: 1
    }
}));

import { describe, expect, test, beforeEach } from '@jest/globals';
import * as vscode from 'vscode';
import { ServiceManager } from '../../../../src/services/service-manager';
import { EnhancedLogger } from '../../../../src/utils/logger';
import { createTestContext } from '../helpers/setup-helper';

describe('Service Activation', () => {
    let serviceManager: ServiceManager;
    let logger: EnhancedLogger;
    let progressSpy: jest.SpyInstance;

    beforeEach(async () => {
        jest.clearAllMocks();
        const context = createTestContext();
        logger = EnhancedLogger.getInstance();

        progressSpy = jest.spyOn(vscode.window, 'withProgress');
        serviceManager = await ServiceManager.initialize(context, logger);
    });

    test('initializes core services with progress tracking', async () => {
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Initializing Services',
            cancellable: false
        }, async (progress) => {
            progress.report({ message: 'Starting service initialization...' });
            
            const services = await serviceManager.initializeServices();
            
            expect(services.codyService).toBeDefined();
            expect(services.toolchainService).toBeDefined();
            expect(services.securityService).toBeDefined();
            expect(progressSpy).toHaveBeenCalled();
        });
    });

    test('handles service dependencies correctly', async () => {
        const services = await serviceManager.getServices();
        expect(services.metricsService?.isInitialized()).toBeTruthy();
        expect(services.codyService?.getDependencies()).toContain('metricsService');
    });

    test('manages service lifecycle events', async () => {
        console.log('Starting lifecycle event test');
        
        const lifecycleSpy = jest.fn((event) => {
            console.log('Lifecycle event received:', event);
        });
        
        serviceManager.onServiceStateChange(lifecycleSpy);
        console.log('Event listener registered');
        
        await serviceManager.startServices();
        console.log('Services started');
        
        const services = await serviceManager.getServices();
        console.log('Services retrieved:', {
            codyInitialized: services.codyService?.isInitialized(),
            dependencies: services.codyService?.getDependencies()
        });
        
        expect(services.codyService?.isInitialized()).toBeTruthy();
        expect(services.codyService?.getDependencies()).toContain('metricsService');
        
        console.log('Spy calls:', lifecycleSpy.mock.calls);
        console.log('Spy results:', lifecycleSpy.mock.results);
        
        expect(lifecycleSpy).toHaveBeenCalledWith(expect.objectContaining({
            type: 'serviceStarted'
        }));
    });
    
    

    
    

});


/*
The command 

npm run test:suite -- tests/suite/activation/test-cases/activation-services.test.ts 

is running all test files that match the pattern, which includes:

config_manager.test.ts
extension.test.ts
index.integration.test.ts
index.test.ts
runTest.test.ts
testHelpers.test.ts
activation-services.test.ts
*/