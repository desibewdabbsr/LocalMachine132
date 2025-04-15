import React, { useEffect, useState } from 'react';
import { PerformanceMetrics } from '../../../metrics/PerformanceMonitor';
import { VSCodeWrapper } from '../../vscode-api';

interface MetricsHistory {
    timestamps: number[];
    metrics: PerformanceMetrics[];
}

interface SystemAlert {
    level: 'info' | 'warning' | 'critical';
    message: string;
    timestamp: number;
}

interface SystemAlerts {
    current: SystemAlert[];
    history: SystemAlert[];
}

interface DashboardProps {
    vscodeApi: VSCodeWrapper;
}

export const MetricsDashboard: React.FC<DashboardProps> = ({ vscodeApi }) => {

    const [realTimeMetrics, setRealTimeMetrics] = useState<PerformanceMetrics | null>(null);
    const [historicalData, setHistoricalData] = useState<MetricsHistory>({ timestamps: [], metrics: [] });
    const [alerts, setAlerts] = useState<SystemAlerts>({ current: [], history: [] });

    useEffect(() => {
        const interval = setInterval(() => {
            vscodeApi.postMessage({ command: 'getMetrics' });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const messageHandler = (event: MessageEvent) => {
            const message = event.data;
            switch (message.type) {
                case 'metrics':
                    updateMetrics(message.payload);
                    break;
                case 'alert':
                    handleAlert(message.payload);
                    break;
            }
        };

        window.addEventListener('message', messageHandler);
        return () => window.removeEventListener('message', messageHandler);
    }, []);

    const updateMetrics = (metrics: PerformanceMetrics) => {
        setRealTimeMetrics(metrics);
        setHistoricalData(prev => ({
            timestamps: [...prev.timestamps, Date.now()],
            metrics: [...prev.metrics, metrics]
        }));
    };

    const handleAlert = (alert: SystemAlert) => {
        setAlerts(prev => ({
            current: [...prev.current, alert],
            history: [...prev.history, alert]
        }));
    };

    return (
        <div className="metrics-dashboard" data-testid="metrics-dashboard">
            {realTimeMetrics && (
                <div className="real-time-metrics">
                    <h2>Real-Time Metrics</h2>
                    <div className="metric-value">CPU: {realTimeMetrics.cpuUsage}%</div>
                    <div className="metric-value">Memory: {realTimeMetrics.memoryUsage}%</div>
                </div>
            )}
            
            <div className="alerts-panel">
                {alerts.current.map((alert, index) => (
                    <div key={index} className={`alert ${alert.level}`}>
                        {alert.message}
                    </div>
                ))}
            </div>
        </div>
    );
};