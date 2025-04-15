/**
 * @jest-environment jsdom
 */

jest.mock('vscode');
jest.mock('../../../../../../src/utils/logger', () => ({
    EnhancedLogger: {
        getInstance: jest.fn().mockReturnValue({
            info: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
            logOperation: jest.fn().mockImplementation(async (_, __, fn) => fn()),
            getConfig: jest.fn().mockReturnValue({
                logLevel: 'INFO',
                mode: 'development'
            })
        })
    }
}));

import { describe, expect, test, beforeEach, afterEach } from '@jest/globals';
import { AlertSystem } from '../../../../../../webview/components/features/monitoring/alert-system';
import { AlertSystemMockAPI } from '../../../../../mockes/alert-system-mock';
import { EnhancedLogger } from '../../../../../../src/utils/logger';

describe('AlertSystem', () => {
    let alertSystem: AlertSystem;
    let mockVSCode: AlertSystemMockAPI;
    let mockLogger: jest.Mocked<EnhancedLogger>;

    beforeEach(() => {
        jest.useFakeTimers();
        mockVSCode = new AlertSystemMockAPI();
        mockVSCode.postMessage = jest.fn().mockImplementation(() => 
            Promise.resolve({
                configs: [
                    {
                        severity: 'critical',
                        threshold: 90,
                        metric: 'cpuUsage',
                        enabled: true
                    }
                ]
            })
        );

        mockLogger = {
            debug: jest.fn(),
            info: jest.fn(),
            error: jest.fn(),
            logOperation: jest.fn().mockImplementation(async (_, __, fn) => fn())
        } as any;

        (EnhancedLogger.getInstance as jest.Mock).mockReturnValue(mockLogger);
        alertSystem = new AlertSystem(mockVSCode);
    });

    afterEach(() => {
        jest.clearAllTimers();
        alertSystem.dispose();
    });

    test('initializes successfully', async () => {
        await alertSystem.initialize();
        expect(mockVSCode.postMessage).toHaveBeenCalledWith({
            command: 'getAlertConfigs'
        });
        expect(mockLogger.info).toHaveBeenCalledWith(
            'Alert system initialized successfully'
        );
    });

    test('processes metric updates correctly', async () => {
        await alertSystem.initialize();
        const alert = await alertSystem.processMetricUpdate('cpuUsage', 95);
        
        expect(alert).toBeTruthy();
        expect(alert?.severity).toBe('critical');
        expect(mockVSCode.postMessage).toHaveBeenCalledWith({
            command: 'alertTriggered',
            alert: expect.any(Object)
        });
    });

    test('handles initialization failures', async () => {
        mockVSCode.postMessage = jest.fn().mockRejectedValue(new Error('Failed to fetch configs'));
        await expect(alertSystem.initialize()).rejects.toThrow('Failed to initialize alert system');
    });
});



// npm run test -- tests/suite/webview/components/features/monitoring/alert-system.test.ts