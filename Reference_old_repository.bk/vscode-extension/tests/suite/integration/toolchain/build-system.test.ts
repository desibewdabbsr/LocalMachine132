jest.mock('../../../../src/utils/logger', () => ({
    EnhancedLogger: {
        getInstance: jest.fn().mockReturnValue({
            info: jest.fn(),
            error: jest.fn(),
            logOperation: jest.fn().mockImplementation((_, __, fn) => fn())
        })
    }
}));

const mockFileType = {
    File: 1,
    Directory: 2,
    SymbolicLink: 64
};

jest.mock('vscode', () => ({
    ...jest.requireActual('vscode'),
    FileType: mockFileType,
    workspace: {
        fs: {
            createDirectory: jest.fn(),
            readDirectory: jest.fn()
        }
    },
    Uri: {
        file: jest.fn(path => path)
    }
}));

import { describe, expect, test, beforeEach } from '@jest/globals';
import { BuildSystem } from '../../../../src/integration/toolchain/build-system';
import * as vscode from 'vscode';
import * as path from 'path';






describe('BuildSystem', () => {
    let buildSystem: BuildSystem;
    const mockWorkspaceRoot = '/test/workspace';

    beforeEach(() => {
        jest.clearAllMocks();
        buildSystem = new BuildSystem(mockWorkspaceRoot);
        (vscode.workspace.fs.readDirectory as jest.Mock).mockResolvedValue([
            ['output.js', mockFileType.File],
            ['output.js.map', mockFileType.File]
        ]);
    });

    test('executes build successfully', async () => {
        const config = {
            target: 'production',
            optimization: true,
            debug: false,
            outputDir: 'dist',
            sourceMap: true
        };

        const result = await buildSystem.build(config);
        expect(result.success).toBe(true);
        expect(result.artifacts).toHaveLength(2);
    });

    test('handles build configuration validation', async () => {
        const invalidConfig = {
            target: '',
            optimization: true,
            debug: false,
            outputDir: 'dist',
            sourceMap: true
        };

        const result = await buildSystem.build(invalidConfig);

        expect(result.success).toBe(false);
        expect(result.errors).toContain('Build target must be specified');
    });

    test('collects build artifacts correctly', async () => {
        const config = {
            target: 'development',
            optimization: false,
            debug: true,
            outputDir: 'build',
            sourceMap: true
        };

        const result = await buildSystem.build(config);

        expect(result.artifacts).toContain(path.join(mockWorkspaceRoot, 'build', 'output.js'));
        expect(result.artifacts).toContain(path.join(mockWorkspaceRoot, 'build', 'output.js.map'));
    });
});


// npm run test:suite -- tests/suite/integration/toolchain/build-system.test.ts