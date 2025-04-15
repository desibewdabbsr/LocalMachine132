const mockUpdate = jest.fn().mockResolvedValue(undefined);

jest.mock('vscode', () => ({
    workspace: {
        getConfiguration: jest.fn().mockReturnValue({
            get: jest.fn().mockImplementation((key: string) => ({
                mode: 'development',
                logLevel: 'INFO',
                metricsEnabled: true
            })[key]),
            update: mockUpdate
        })
    },
    ConfigurationTarget: {
        Global: 1,
        Workspace: 2,
        WorkspaceFolder: 3
    }
}));
import { describe, expect, test, beforeEach } from '@jest/globals';
import { ConfigManager } from '../../../../src/config/config_manager';
import { vscode } from '../../../mockes/vscode.mock';

describe('Configuration Updates', () => {
    let configManager: ConfigManager;
    let mockConfig: any;

    beforeEach(() => {
        jest.clearAllMocks();
        configManager = ConfigManager.getInstance();
        
        mockConfig = {
            get: jest.fn(),
            update: jest.fn().mockReturnValue(Promise.resolve())
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

    test('handles configuration updates', async () => {
        await configManager.updateConfig('mode', 'production');
        expect(mockConfig.update).toHaveBeenCalledWith('mode', 'production', true);
        expect(vscode.workspace.getConfiguration).toHaveBeenCalled();
    });
});



// npm run test:suite -- tests/suite/activation/test-cases/config-update.test.ts


