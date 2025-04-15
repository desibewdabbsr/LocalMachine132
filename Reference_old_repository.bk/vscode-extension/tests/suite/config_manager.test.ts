import { describe, expect, test, beforeEach, jest } from '@jest/globals';
import { ConfigManager } from '../../src/config/config_manager';
import { vscode } from '../mockes/vscode.mock';

describe('ConfigManager', () => {
    let configManager: ConfigManager;
    let mockConfig: any;

    beforeEach(() => {
        jest.clearAllMocks();
        configManager = ConfigManager.getInstance();
        
        mockConfig = {
            get: jest.fn(),
            update: jest.fn().mockReturnValue(Promise.resolve())  // This fixes the type error
        };

        vscode.workspace.getConfiguration = jest.fn().mockReturnValue(mockConfig);
        
        mockConfig.get.mockImplementation((key: string) => {
            const defaults: { [key: string]: any } = {
                'mode': 'development',
                'cody.endpoint': 'http://localhost:3000',
                'logLevel': 'INFO',
                'security.analysisEnabled': true,
                'toolchain.rust.channel': 'stable'
            };
            return defaults[key];
        });
    });

    test('loads default configuration', async () => {
        const config = await configManager.getLoggerConfig();
        
        expect(config.mode).toBe('development');
        expect(config.cody.endpoint).toBe('http://localhost:3000');
        expect(config.logLevel).toBe('INFO');
        expect(config.security.analysisEnabled).toBe(true);
        expect(config.toolchain.rust.channel).toBe('stable');
    });

    test('handles configuration updates', async () => {
        await configManager.updateConfig('mode', 'production');
        
        expect(mockConfig.update).toHaveBeenCalledWith('mode', 'production', true);
        expect(vscode.workspace.getConfiguration).toHaveBeenCalled();
    });

    test('throws error when accessing config before loading', () => {
        const newManager = ConfigManager.getInstance();
        (newManager as any).config = null;
        expect(() => newManager.getConfig()).toThrow('Configuration not loaded');
    });
    
});



// npm run test:suite -- tests/suite/config_manager.test.ts

// run separate tests
// npm run test:suite -- tests/suite/config_manager.test.ts --testPathIgnorePatterns=index.test.ts
