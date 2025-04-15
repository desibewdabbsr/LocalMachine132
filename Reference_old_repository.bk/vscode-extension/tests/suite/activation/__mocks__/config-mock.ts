// tests/suite/activation/__mocks__/config-mock.ts
import { ExtensionConfig } from '../../../types';

export const mockConfigData: ExtensionConfig = {
    mode: 'development',
    logLevel: 'INFO',
    metricsEnabled: true,
    mockEnabled: true,
    mockResponsePath: '/test/path',
    retentionDays: 30,
    cody: {
        endpoint: 'http://localhost:3000',
        timeout: 30000,
        retryAttempts: 3
    },
    security: {
        analysisEnabled: true,
        vulnerabilityScanLevel: 'deep',
        autoFix: false
    },
    toolchain: {
        rust: {
            channel: 'stable',
            components: ['rustfmt', 'clippy']
        },
        solidity: {
            version: '0.8.19',
            optimizer: true
        }
    }
};

export const mockWorkspaceConfig = {
    get: jest.fn().mockImplementation((key: keyof ExtensionConfig) => mockConfigData[key]),
    update: jest.fn().mockResolvedValue(undefined),
    inspect: jest.fn()
};