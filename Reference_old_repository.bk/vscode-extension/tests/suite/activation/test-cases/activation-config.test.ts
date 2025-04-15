const mockUpdate = jest.fn().mockResolvedValue(undefined);

jest.mock('vscode', () => ({
    workspace: {
        getConfiguration: jest.fn().mockReturnValue({
            get: jest.fn().mockImplementation((key: string) => ({
                mode: 'development',
                cody: {
                    endpoint: 'http://localhost:3000'
                },
                logLevel: 'INFO',
                security: {
                    analysisEnabled: true
                },
                toolchain: {
                    rust: {
                        channel: 'stable'
                    }
                }
            })[key]),
            update: mockUpdate,
            has: jest.fn().mockReturnValue(true),
            inspect: jest.fn()
        })
    },
    ConfigurationTarget: {
        Global: 1
    }
}));

import { describe, expect, test, beforeEach } from '@jest/globals';
import { ConfigManager } from '../../../../src/config/config_manager';


describe('Configuration Activation', () => {
    let configManager: ConfigManager;

    beforeEach(async () => {
        jest.clearAllMocks();
        configManager = ConfigManager.getInstance();
        await configManager.loadConfig();
    });

    test('loads initial configuration', () => {
        const config = configManager.getConfig();
        expect(config).toBeDefined();
    });

    test('maintains singleton instance', () => {
        const instance1 = ConfigManager.getInstance();
        const instance2 = ConfigManager.getInstance();
        expect(instance1).toBe(instance2);
    });
});



// npm run test:suite -- tests/suite/activation/test-cases/activation-config.test.ts