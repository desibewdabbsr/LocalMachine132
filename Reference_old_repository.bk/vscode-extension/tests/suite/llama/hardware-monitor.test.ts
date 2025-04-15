/**
 * @jest-environment jsdom
 */

jest.mock('../../../src/utils/logger', () => ({
    EnhancedLogger: {
        getInstance: jest.fn().mockReturnValue({
            info: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn()
        })
    }
}));

import { describe, expect, test, beforeEach, jest } from '@jest/globals';
import { HardwareMonitor } from '../../../src/integration/llama/optimization/hardware-monitor';
import { EnhancedLogger } from '../../../src/utils/logger';

describe('HardwareMonitor', () => {
    let monitor: HardwareMonitor;
    let mockLogger: jest.Mocked<EnhancedLogger>;

    beforeEach(() => {
        jest.clearAllMocks();
        mockLogger = EnhancedLogger.getInstance() as jest.Mocked<EnhancedLogger>;
        monitor = new HardwareMonitor();
    });

    test('starts monitoring successfully', () => {
        monitor.startMonitoring();
        expect(mockLogger.info).toHaveBeenCalledWith(
            expect.stringContaining('Starting hardware monitoring')
        );
    });

    test('prevents duplicate monitoring sessions', () => {
        monitor.startMonitoring();
        expect(() => monitor.startMonitoring()).toThrow('Hardware monitoring is already active');
    });

    test('stops monitoring gracefully', () => {
        monitor.startMonitoring();
        monitor.stopMonitoring();
        expect(mockLogger.info).toHaveBeenCalledWith('Hardware monitoring stopped');
    });

    test('collects current resource usage', () => {
        const usage = monitor.getCurrentUsage();
        expect(usage.cpuUsage).toBeDefined();
        expect(usage.memoryUsage).toBeDefined();
        expect(usage.threadCount).toBeGreaterThan(0);
    });

    test('retrieves metrics within time range', async () => {
        monitor.startMonitoring();
        await new Promise(resolve => setTimeout(resolve, 1100));
        
        const timeRange = {
            start: Date.now() - 1000,
            end: Date.now()
        };
        
        const metrics = monitor.getMetrics(timeRange);
        expect(metrics.length).toBeGreaterThan(0);
        expect(metrics[0].timestamp).toBeGreaterThanOrEqual(timeRange.start);
        
        monitor.stopMonitoring();
    });

    test('handles high resource usage warnings', () => {
        // Mock high CPU usage
        jest.spyOn(monitor as any, 'getCPUUsage').mockReturnValue(0.9);
        
        monitor.getCurrentUsage();
        expect(mockLogger.warn).toHaveBeenCalledWith(
            expect.stringContaining('High CPU usage detected')
        );
    });

    test('maintains metrics retention limit', async () => {
        monitor.startMonitoring();
        await new Promise(resolve => setTimeout(resolve, 3100)); // Collect 3 metrics
        
        const metrics = monitor.getMetrics();
        expect(metrics.length).toBeLessThanOrEqual(3600);
        
        monitor.stopMonitoring();
    });

    test('handles monitoring errors gracefully', () => {
        // Mock process.memoryUsage to throw an error
        jest.spyOn(process, 'memoryUsage').mockImplementation(() => {
            throw new Error('Memory usage error');
        });
    
        // Start monitoring which will trigger metrics collection
        monitor.startMonitoring();
    
        // Force immediate metrics collection
        (monitor as any).collectMetrics();
    
        // Verify error logging
        expect(mockLogger.error).toHaveBeenCalledWith(
            JSON.stringify({
                message: 'Metrics collection failed',
                error: 'Memory usage error'
            })
        );
    });
    
});



// Run tests with:
// npm run test -- tests/suite/llama/hardware-monitor.test.ts