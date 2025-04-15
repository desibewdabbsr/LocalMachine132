import React, { useState, useEffect } from 'react';
import { COLORS } from '../../../styles/theme/colors';
import { ANIMATIONS } from '../../../styles/theme/animations';

interface MetricData {
    value: number;
    threshold: number;
    unit: string;
    label: string;
}

interface PerformanceMetricProps {
    metrics: MetricData[];
    refreshRate?: number; // in milliseconds
    onThresholdExceeded?: (metric: MetricData) => void;
}

export const PerformanceMetric: React.FC<PerformanceMetricProps> = ({
    metrics,
    refreshRate = 1000,
    onThresholdExceeded
}) => {
    const [currentMetrics, setCurrentMetrics] = useState(metrics);

    useEffect(() => {
        const interval = setInterval(() => {
            // Simulate real-time updates
            const updatedMetrics = metrics.map(metric => {
                const newValue = metric.value + (Math.random() * 2 - 1);
                if (newValue > metric.threshold && onThresholdExceeded) {
                    onThresholdExceeded({ ...metric, value: newValue });
                }
                return { ...metric, value: newValue };
            });
            setCurrentMetrics(updatedMetrics);
        }, refreshRate);

        return () => clearInterval(interval);
    }, [metrics, refreshRate, onThresholdExceeded]);

    return (
        <div className="performance-metrics">
            {currentMetrics.map((metric, index) => (
                <div 
                    key={index} 
                    className={`metric-card ${metric.value > metric.threshold ? 'alert' : ''}`}
                >
                    <div className="metric-header">
                        <span className="metric-label">{metric.label}</span>
                        <div className="metric-indicator" />
                    </div>
                    <div className="metric-value">
                        {metric.value.toFixed(2)}
                        <span className="metric-unit">{metric.unit}</span>
                    </div>
                    <div className="metric-threshold">
                        Threshold: {metric.threshold} {metric.unit}
                    </div>
                </div>
            ))}
        </div>
    );
};