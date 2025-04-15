jest.mock('../../../../src/utils/logger', () => ({
    EnhancedLogger: {
        getInstance: jest.fn().mockReturnValue({
            info: jest.fn(),
            error: jest.fn(),
            logOperation: jest.fn().mockImplementation((_, __, fn) => fn())
        })
    }
}));

import { describe, expect, test, beforeEach } from '@jest/globals';
import { AIOrchestratorConfig } from '../../../../src/integration/ai/ai-orchestrator-config';
import { EnhancedLogger } from '../../../../src/utils/logger';

describe('AIOrchestratorConfig', () => {
    let config: AIOrchestratorConfig;
    let mockExtensionConfig: any;

    beforeEach(() => {
        mockExtensionConfig = {
            cody: {
                endpoint: 'https://api.example.com',
                timeout: 5000,
                retryAttempts: 3
            }
        };
        config = new AIOrchestratorConfig(mockExtensionConfig);
    });

    test('initializes with valid configuration', () => {
        const aiConfig = config.getConfig();
        expect(aiConfig.endpoint).toBe('https://api.example.com');
        expect(aiConfig.timeout).toBe(5000);
        expect(aiConfig.retryAttempts).toBe(3);
    });

    test('updates configuration successfully', async () => {
        await config.updateConfig({ timeout: 10000 });
        const updatedConfig = config.getConfig();
        expect(updatedConfig.timeout).toBe(10000);
    });

    test('validates configuration correctly', () => {
        expect(config.validateConfig()).toBe(true);
        
        const invalidConfig = new AIOrchestratorConfig({
            ...mockExtensionConfig,
            cody: {
                endpoint: '',
                timeout: -1,
                retryAttempts: 0
            }
        });
        expect(invalidConfig.validateConfig()).toBe(false);
    });
});


// npm run test:suite -- tests/suite/integration/ai/ai-orchestrator-config.test.ts