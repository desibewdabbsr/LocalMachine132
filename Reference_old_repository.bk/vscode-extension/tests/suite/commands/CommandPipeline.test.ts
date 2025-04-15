/**
 * @jest-environment jsdom
 */

jest.mock('../../../src/utils/logger', () => ({
    EnhancedLogger: {
        getInstance: jest.fn().mockReturnValue({
            info: jest.fn(),
            error: jest.fn(),
            logOperation: jest.fn().mockImplementation(async (_: string, __: string, fn: () => Promise<any>) => fn())
        })
    }
}));

import { CommandPipeline } from '../../../src/commands/CommandPipeline';
import { HardwareConfig } from '../../types';
import { EnhancedLogger } from '../../../src/utils/logger';

describe('CommandPipeline', () => {
    let commandPipeline: CommandPipeline;
    let mockLogger: EnhancedLogger;
    
    const defaultConfig: HardwareConfig = {
        device: 'cpu',
        threads: 4,
        memoryLimit: 4096,
        batchSize: 8,
        memoryAllocation: 'dynamic',
        cudaCores: 0,
        cpuArchitecture: 'x86',
        multiGpu: false,
        performanceMode: 'balanced'
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockLogger = EnhancedLogger.getInstance();
        commandPipeline = new CommandPipeline(defaultConfig, mockLogger);
    });

    test('executes command pipeline phases correctly', async () => {
        commandPipeline.preProcess();
        await commandPipeline.execute();
        commandPipeline.postProcess();

        expect(mockLogger.info).toHaveBeenCalledWith('Command pre-processing initiated');
        expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('completed in'));
    });

    test('validates GPU configuration', async () => {
        const gpuConfig: HardwareConfig = {
            ...defaultConfig,
            device: 'cuda',
            cudaCores: 0
        };
        
        commandPipeline = new CommandPipeline(gpuConfig, mockLogger);
        
        await expect(async () => {
            commandPipeline.preProcess();
            await commandPipeline.execute();
        }).rejects.toThrow('GPU configuration invalid');
    });

    test('tracks execution metrics', async () => {
        const startTime = Date.now();
        
        commandPipeline.preProcess();
        await commandPipeline.execute();
        commandPipeline.postProcess();
        
        expect(mockLogger.info).toHaveBeenCalledWith(
            expect.stringMatching(/completed in \d+ms/)
        );
    });
});