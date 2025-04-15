import { describe, expect, test } from '@jest/globals';
import { BASE_PATHS, pathUtils } from '../../../../config/base/paths';
import { join } from 'path';

describe('BASE_PATHS Configuration', () => {
    const mockRootDir = process.cwd();

    describe('Core Directory Structure', () => {
        test('validates root paths', () => {
            expect(BASE_PATHS.ROOT).toBe(mockRootDir);
            expect(BASE_PATHS.BACKEND).toBe(join(mockRootDir, 'backend'));
            expect(BASE_PATHS.VSCODE_EXTENSION).toBe(join(mockRootDir, 'vscode-extension'));
        });

        test('validates config paths', () => {
            expect(BASE_PATHS.CONFIG.ROOT).toBeDefined();
            expect(BASE_PATHS.CONFIG.TEMPLATES).toBeDefined();
            expect(BASE_PATHS.CONFIG.NODE_CONFIG).toContain('nodejs_config.yaml');
        });

        test('validates AI integration paths', () => {
            const { AI_INTEGRATION } = BASE_PATHS.CORE;
            expect(AI_INTEGRATION.CODY.ROOT).toBeDefined();
            expect(AI_INTEGRATION.ML_ENGINE.ROOT).toBeDefined();
            expect(AI_INTEGRATION.GENERATORS.ROOT).toBeDefined();
        });

        test('validates language handler paths', () => {
            const { LANGUAGE_HANDLERS } = BASE_PATHS.CORE;
            expect(LANGUAGE_HANDLERS.NODEJS.ROOT).toBeDefined();
            expect(LANGUAGE_HANDLERS.PYTHON.ROOT).toBeDefined();
            expect(LANGUAGE_HANDLERS.SOLIDITY.ROOT).toBeDefined();
            expect(LANGUAGE_HANDLERS.WEB3.ROOT).toBeDefined();
        });
    });

    describe('VSCode Extension Structure', () => {
        test('validates VSCode root paths', () => {
            const { VSCODE } = BASE_PATHS;
            expect(VSCODE.ROOT).toBeDefined();
            expect(VSCODE.SRC.ROOT).toBeDefined();
            expect(VSCODE.WEBVIEW.ROOT).toBeDefined();
        });

        test('validates integration paths', () => {
            const { INTEGRATION } = BASE_PATHS.VSCODE.SRC;
            expect(INTEGRATION.AI).toBeDefined();
            expect(INTEGRATION.LLAMA.ROOT).toBeDefined();
            expect(INTEGRATION.LLAMA.CORE).toBeDefined();
            expect(INTEGRATION.TOOLCHAIN).toBeDefined();
        });

        test('validates test suite paths', () => {
            const { TESTS } = BASE_PATHS.VSCODE;
            expect(TESTS.SUITE.ROOT).toBeDefined();
            expect(TESTS.SUITE.ACTIVATION).toBeDefined();
            expect(TESTS.SUITE.INTEGRATION).toBeDefined();
            expect(TESTS.SUITE.WEBVIEW).toBeDefined();
        });

        test('validates webview component paths', () => {
            const { COMPONENTS } = BASE_PATHS.VSCODE.WEBVIEW;
            expect(COMPONENTS.COMMON).toBeDefined();
            expect(COMPONENTS.DEBUG).toBeDefined();
            expect(COMPONENTS.FEATURES).toBeDefined();
            expect(COMPONENTS.NETWORK).toBeDefined();
        });
    });

    describe('Runtime and Tools', () => {
        test('validates runtime paths', () => {
            const { RUNTIME } = BASE_PATHS;
            expect(RUNTIME.METRICS).toBeDefined();
            expect(RUNTIME.LOGS).toBeDefined();
            expect(RUNTIME.CACHE).toBeDefined();
            expect(RUNTIME.TEMP).toBeDefined();
        });

        test('validates tool paths', () => {
            const { TOOLS } = BASE_PATHS;
            expect(TOOLS.SCRIPTS.ROOT).toBeDefined();
            expect(TOOLS.SCRIPTS.DEV_INSTALL).toBeDefined();
            expect(TOOLS.HARDHAT).toBeDefined();
        });
    });

    describe('Path Management Functions', () => {
        test('ensurePaths creates directories', async () => {
            await expect(pathUtils.ensurePaths()).resolves.not.toThrow();
        });

        test('validatePaths returns true for valid paths', () => {
            expect(pathUtils.validatePaths()).toBe(true);
        });

        test('validatePaths handles missing directories', () => {
            const mockStatSync = jest.spyOn(require('fs'), 'statSync');
            mockStatSync.mockImplementation(() => { throw new Error(); });
            expect(pathUtils.validatePaths()).toBe(false);
            mockStatSync.mockRestore();
        });
    });
});


// npm run test:paths 