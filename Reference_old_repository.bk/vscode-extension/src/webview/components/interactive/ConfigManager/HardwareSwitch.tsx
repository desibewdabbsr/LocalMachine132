import React, { useState, useEffect } from 'react';
import { UISystem, ThemeSystem } from '../../../centralized-theme';
import { VSCodeWrapper } from '../../../vscode-api';
import { SystemHealthProps } from '../../common/types/indicators';

const { CommandButton, ToggleSwitch } = UISystem.Controls;
const { COLORS, TYPOGRAPHY, ANIMATIONS } = ThemeSystem;

interface HardwareConfig {
    device: 'cpu' | 'cuda';
    threads: number;
    memoryLimit: number;
    batchSize: number;
    memoryAllocation: 'dynamic' | 'static';
    cudaCores: number;
    cpuArchitecture: 'x86' | 'arm' | 'auto';
    multiGpu: boolean;
    performanceMode: 'low' | 'balanced' | 'performance';
}

interface HardwareSwitchProps {
    onConfigChange: (config: HardwareConfig) => void;
    vscodeApi: VSCodeWrapper;
    initialDevice?: 'cpu' | 'cuda';
    initialPerformanceMode?: 'low' | 'balanced' | 'performance';
}

const defaultConfig: HardwareConfig = {
    device: 'cpu',
    threads: navigator.hardwareConcurrency || 4,
    memoryLimit: 4096,
    batchSize: 8,
    memoryAllocation: 'dynamic',
    cudaCores: 0,
    cpuArchitecture: 'auto',
    multiGpu: false,
    performanceMode: 'balanced'
};

// Type assertion for SystemHealth component
const SystemHealth = UISystem.Indicators.SystemHealth as React.FC<SystemHealthProps>;

export const HardwareSwitch: React.FC<HardwareSwitchProps> = ({ 
    onConfigChange, 
    vscodeApi,
    initialDevice = 'cpu',
    initialPerformanceMode = 'balanced'
}) => {
    const [config, setConfig] = useState<HardwareConfig>(
        vscodeApi.getState<HardwareConfig>() || defaultConfig
    );

    useEffect(() => {
        vscodeApi.setState(config);
        onConfigChange(config);
    }, [config, onConfigChange]);

    
    const handleThreadCountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const threads = parseInt(event.target.value, 10);
        setConfig(prev => ({
            ...prev,
            threads
        }));
    };

    const handleMemoryAllocationToggle = () => {
        setConfig(prev => ({
            ...prev,
            memoryAllocation: 'static'
        }));
    };

    const handleDeviceToggle = (device: 'cpu' | 'cuda') => {
        setConfig(prev => ({
            ...prev,
            device,
            batchSize: device === 'cuda' ? 32 : 8,
            memoryLimit: device === 'cuda' ? 8192 : 4096
        }));
    };

    const handlePerformanceMode = (mode: 'low' | 'balanced' | 'performance') => {
        const modeConfigs = {
            low: {
                memoryLimit: 2048,
                batchSize: 4,
                threads: Math.max(1, Math.floor(navigator.hardwareConcurrency / 4))
            },
            balanced: {
                memoryLimit: 4096,
                batchSize: 8,
                threads: Math.max(2, Math.floor(navigator.hardwareConcurrency / 2))
            },
            performance: {
                memoryLimit: 8192,
                batchSize: 16,
                threads: navigator.hardwareConcurrency
            }
        };

        setConfig(prev => ({
            ...prev,
            ...modeConfigs[mode],
            performanceMode: mode
        }));
    };

    return (
        <div className="hardware-switch" style={{
            backgroundColor: COLORS.background.deep,
            fontFamily: TYPOGRAPHY.fonts.command,
            animation: ANIMATIONS.powerUp.sequence
        }}>
            <header className="command-header">
                <UISystem.Layout.StatusBar status="operational" />
                <SystemHealth 
                    status="optimal"
                    metrics={{
                        cpu: config.threads,
                        memory: config.memoryLimit,
                        latency: 120
                    }}
                    onThreadChange={handleThreadCountChange}
                    onMemoryAllocationToggle={handleMemoryAllocationToggle}
                />
            </header>

            <section className="device-controls">
                <h3 style={{ color: COLORS.primary.main }}>Processing Device</h3>
                <div className="toggle-buttons">
                    <CommandButton 
                        label="CPU"
                        variant="primary"
                        onClick={() => handleDeviceToggle('cpu')}
                        isActive={config.device === 'cpu'}
                    />
                    <CommandButton 
                        label="GPU"
                        variant="primary"
                        onClick={() => handleDeviceToggle('cuda')}
                        isActive={config.device === 'cuda'}
                    />
                </div>
            </section>

            <section className="performance-controls">
                <h3>Performance Mode</h3>
                <div className="mode-buttons">
                    {['low', 'balanced', 'performance'].map(mode => (
                        <CommandButton 
                            key={mode}
                            label={mode.charAt(0).toUpperCase() + mode.slice(1)}
                            variant="primary"
                            onClick={() => handlePerformanceMode(mode as 'low' | 'balanced' | 'performance')}
                            isActive={mode === config.performanceMode}
                        />
                    ))}
                </div>
            </section>

            <UISystem.Indicators.PerformanceMetric 
                metrics={[{
                    value: config.threads,
                    threshold: navigator.hardwareConcurrency || 8,
                    unit: 'threads',
                    label: 'CPU Threads'
                }]}
            />
        </div>
    );
};