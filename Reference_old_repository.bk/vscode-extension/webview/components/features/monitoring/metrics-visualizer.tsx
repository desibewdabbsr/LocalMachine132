import React, { useEffect, useState } from 'react';
import { EnhancedLogger } from '../../../../src/utils/logger';
import { MetricsService } from '../../../../src/services/metrics-service';
import { VSCodeAPI } from '../../../../tests/mockes/vscode-api';

interface MetricsData {
    performance: PerformanceMetrics;
    resources: ResourceMetrics;
    operations: OperationMetrics[];
}

interface PerformanceMetrics {
    responseTime: number;
    throughput: number;
    latency: number;
}

interface ResourceMetrics {
    cpuUsage: number;
    memoryUsage: number;
    networkIO: number;
}

interface OperationMetrics {
    name: string;
    duration: number;
    status: 'success' | 'failure';
    timestamp: number;
}

export const MetricsVisualizer: React.FC<{ vscode: VSCodeAPI }> = ({ vscode }) => {
    const [metrics, setMetrics] = useState<MetricsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const logger = EnhancedLogger.getInstance();

    useEffect(() => {
        const initializeMetrics = async () => {
            await logger.logOperation('metrics-visualizer', 'initialize', async () => {
                try {
                    setLoading(true);
                    vscode.postMessage({
                        command: 'getMetrics',
                        payload: { timeRange: '1h' }
                    });
                    logger.info('Metrics visualization initialized');
                } catch (err) {
                    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
                    logger.error(`Metrics initialization failed: ${errorMsg}`);
                    setError('Failed to initialize metrics visualization');
                }
            });
        };

        initializeMetrics();
    }, []);




    useEffect(() => {
        const messageHandler = async (event: MessageEvent) => {
            await logger.logOperation('metrics-visualizer', 'process-update', async () => {
                try {
                    const message = event.data;
                    if (message?.type === 'metricsUpdate') {
                        if (!message.data) {
                            throw new Error('Invalid metrics data received');
                        }
                        logger.debug('Processing metrics update');
                        setMetrics(message.data);
                        setLoading(false);
                    }
                } catch (err) {
                    logger.error(`Failed to process metrics update: ${err}`);
                    setError('Failed to process metrics update');
                    setLoading(false);
                }
            });
        };

        window.addEventListener('message', messageHandler);
        return () => window.removeEventListener('message', messageHandler);
    }, []);

    
    

    const renderPerformanceMetrics = () => (
        <div className="metrics-section performance">
            <h3>Performance Metrics</h3>
            {metrics?.performance && (
                <div className="metrics-grid">
                    <MetricCard 
                        label="Response Time" 
                        value={`${metrics.performance.responseTime}ms`}
                    />
                    <MetricCard 
                        label="Throughput" 
                        value={`${metrics.performance.throughput}/s`}
                    />
                    <MetricCard 
                        label="Latency" 
                        value={`${metrics.performance.latency}ms`}
                    />
                </div>
            )}
        </div>
    );

    const renderResourceMetrics = () => (
        <div className="metrics-section resources">
            <h3>Resource Usage</h3>
            {metrics?.resources && (
                <div className="metrics-grid">
                    <MetricCard 
                        label="CPU Usage" 
                        value={`${metrics.resources.cpuUsage}%`}
                    />
                    <MetricCard 
                        label="Memory" 
                        value={`${metrics.resources.memoryUsage}MB`}
                    />
                    <MetricCard 
                        label="Network I/O" 
                        value={`${metrics.resources.networkIO}KB/s`}
                    />
                </div>
            )}
        </div>
    );

    if (loading) {
        return <div className="loading">Loading metrics...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="metrics-visualizer">
            {renderPerformanceMetrics()}
            {renderResourceMetrics()}
            <OperationsTimeline operations={metrics?.operations || []} />
        </div>
    );
};

const MetricCard: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div className="metric-card">
        <div className="metric-label">{label}</div>
        <div className="metric-value">{value}</div>
    </div>
);

const OperationsTimeline: React.FC<{ operations: OperationMetrics[] }> = ({ operations }) => (
    <div className="operations-timeline">
        <h3>Operations Timeline</h3>
        <div className="timeline-container">
            {operations.map((op, index) => (
                <div 
                    key={index}
                    className={`timeline-item ${op.status}`}
                    style={{ left: `${(op.timestamp % 100)}%` }}
                >
                    <span className="operation-name">{op.name}</span>
                    <span className="operation-duration">{op.duration}ms</span>
                </div>
            ))}
        </div>
    </div>
);