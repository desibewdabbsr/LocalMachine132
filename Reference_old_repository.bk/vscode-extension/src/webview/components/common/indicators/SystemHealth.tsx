import React from 'react';
import { COLORS } from '../../../styles/theme/colors';
import { ANIMATIONS } from '../../../styles/theme/animations';

interface SystemHealthProps {
    status: 'optimal' | 'degraded' | 'critical';
    metrics: {
        cpu: number;
        memory: number;
        latency: number;
    };
}

export const SystemHealth: React.FC<SystemHealthProps> = ({ status, metrics }) => {
    return (
        <div className="system-health-indicator">
            <div className={`health-status ${status}`}>
                <span className="status-dot" />
                <span className="status-label">{status.toUpperCase()}</span>
            </div>
            <div className="metrics-grid">
                <div className="metric">
                    <label>CPU</label>
                    <span>{metrics.cpu}%</span>
                </div>
                <div className="metric">
                    <label>Memory</label>
                    <span>{metrics.memory}%</span>
                </div>
                <div className="metric">
                    <label>Latency</label>
                    <span>{metrics.latency}ms</span>
                </div>
            </div>
        </div>
    );
};