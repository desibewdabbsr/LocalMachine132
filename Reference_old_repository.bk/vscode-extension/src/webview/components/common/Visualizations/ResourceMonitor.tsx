import React, { useState, useEffect } from 'react';
import { MetricsChart } from './MetricsChart';
import { COLORS } from '../../../styles/theme/colors';

interface ResourceData {
    cpu: number;
    memory: number;
    network: number;
    timestamp: number;
}

interface ResourceMonitorProps {
    refreshRate?: number;
    maxDataPoints?: number;
}

export const ResourceMonitor: React.FC<ResourceMonitorProps> = ({
    refreshRate = 1000,
    maxDataPoints = 100
}) => {
    const [resourceData, setResourceData] = useState<ResourceData[]>([]);

    useEffect(() => {
        const interval = setInterval(() => {
            setResourceData(prev => {
                const newData = {
                    cpu: Math.random() * 100,
                    memory: Math.random() * 100,
                    network: Math.random() * 1000,
                    timestamp: Date.now()
                };
                return [...prev.slice(-maxDataPoints + 1), newData];
            });
        }, refreshRate);

        return () => clearInterval(interval);
    }, [refreshRate, maxDataPoints]);

    return (
        <div className="resource-monitor">
            <div className="monitor-grid">
                <div className="monitor-cell">
                    <h3>CPU Usage</h3>
                    <MetricsChart 
                        data={resourceData.map(d => ({ 
                            value: d.cpu, 
                            timestamp: d.timestamp 
                        }))}
                        lineColor={COLORS.data.primary}
                    />
                </div>
                <div className="monitor-cell">
                    <h3>Memory Usage</h3>
                    <MetricsChart 
                        data={resourceData.map(d => ({ 
                            value: d.memory, 
                            timestamp: d.timestamp 
                        }))}
                        lineColor={COLORS.data.secondary}
                    />
                </div>
                <div className="monitor-cell">
                    <h3>Network Traffic</h3>
                    <MetricsChart 
                        data={resourceData.map(d => ({ 
                            value: d.network, 
                            timestamp: d.timestamp 
                        }))}
                        lineColor={COLORS.data.tertiary}
                    />
                </div>
            </div>
        </div>
    );
};