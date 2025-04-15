import React from 'react';
import '../styles/theme/base.css';
import '../styles/theme/animations.css';
import { COLORS } from '../styles/theme/colors';
import { TYPOGRAPHY } from '../styles/theme/typography';
import { ANIMATIONS } from '../styles/theme/animations';

import { CommandCenter } from '../components/layout/CommandCenter';
import { StatusBar } from '../components/layout/StatusBar';
import { HexGrid } from '../components/layout/HexGrid';
import { SystemHealth } from '../components/common/indicators/SystemHealth';
import { PerformanceMetric } from '../components/common/indicators/PerformanceMetric';
import { ResourceMonitor } from '../components/common/Visualizations/ResourceMonitor';
import { CommandButton } from '../components/common/Controls/CommandButton';
import { HardwareSwitch } from '../components/interactive/ConfigManager/HardwareSwitch.tsx';
import { HardwareConfig } from '../../../tests/types';

interface BaseTemplateProps {
    vscodeApi: any; // VSCode API instance
}

export const BaseTemplate: React.FC<BaseTemplateProps> = ({ vscodeApi }) => {
    const handleHardwareConfigChange = (config: HardwareConfig) => {
        vscodeApi.postMessage({
            command: 'updateHardwareConfig',
            payload: config
        });
    };

    const handleOperationExecute = () => {
        vscodeApi.postMessage({
            command: 'executeOperation',
            timestamp: Date.now()
        });
    };

    return (
        <CommandCenter>
            <div className="command-interface" style={{ 
                backgroundColor: COLORS.background.deep,
                fontFamily: TYPOGRAPHY.fonts.command,
                animation: ANIMATIONS.powerUp.sequence
            }}>
                {/* Header Section */}
                <header className="command-header">
                    <StatusBar status="operational" />
                    <SystemHealth 
                        status="optimal"
                        metrics={{
                            cpu: 45,
                            memory: 60,
                            latency: 120
                        }}
                    />
                </header>

                {/* Main Control Grid */}
                <HexGrid>
                    <div className="performance-section">
                        <PerformanceMetric 
                            metrics={[
                                {
                                    value: 75,
                                    threshold: 90,
                                    unit: '%',
                                    label: 'CPU Usage'
                                }
                            ]}
                        />
                    </div>

                    <div className="monitoring-section">
                        <ResourceMonitor refreshRate={1000} />
                    </div>

                    <div className="hardware-controls">
                        <HardwareSwitch 
                            vscodeApi={vscodeApi}
                            onConfigChange={handleHardwareConfigChange}
                        />
                    </div>
                </HexGrid>

                {/* Command Controls */}
                <footer className="command-footer">
                <CommandButton 
                    label="Execute Operation"
                    variant="primary"
                    onClick={handleOperationExecute}
                    style={{
                        backgroundColor: COLORS.primary.main,
                        borderColor: COLORS.primary.light
                    }}
                />

                </footer>
            </div>
        </CommandCenter>
    );
};