/**
 * @jest-environment jsdom
 */

import { describe, expect, test, beforeEach, jest } from '@jest/globals';
import { HardwareManager } from '../../src/config/hardware-config';

describe('HardwareManager', () => {
    let hardwareManager: HardwareManager;

    beforeEach(() => {
        // Reset environment between tests
        process.env.CUDA_VISIBLE_DEVICES = '';
        // Mock navigator.hardwareConcurrency
        Object.defineProperty(navigator, 'hardwareConcurrency', {
            value: 8,
            configurable: true
        });
        
        hardwareManager = new HardwareManager();
    });

    test('detects optimal configuration based on hardware', () => {
        const config = hardwareManager.getConfig();
        
        expect(config).toEqual({
            device: 'cpu',
            threads: 8,
            memoryLimit: 4096,
            batchSize: 8
        });
    });

    test('detects GPU when available', () => {
        process.env.CUDA_VISIBLE_DEVICES = '0';
        hardwareManager = new HardwareManager();
        
        const config = hardwareManager.getConfig();
        expect(config.device).toBe('cuda');
        expect(config.batchSize).toBe(32);
    });

    test('switches device configuration correctly', () => {
        hardwareManager.toggleDevice('cuda');
        const config = hardwareManager.getConfig();
        
        expect(config).toEqual({
            device: 'cuda',
            threads: 8,
            memoryLimit: 8192,
            batchSize: 32
        });
    });

    test('handles CPU fallback when GPU is unavailable', () => {
        process.env.CUDA_VISIBLE_DEVICES = '-1';
        hardwareManager = new HardwareManager();
        
        const config = hardwareManager.getConfig();
        expect(config.device).toBe('cpu');
    });

    test('optimizes thread count based on available cores', () => {
        Object.defineProperty(navigator, 'hardwareConcurrency', {
            value: 4
        });
        hardwareManager = new HardwareManager();
        
        const config = hardwareManager.getConfig();
        expect(config.threads).toBe(4);
    });
});