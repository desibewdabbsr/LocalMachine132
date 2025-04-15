import React, { useEffect, useRef } from 'react';
import { COLORS } from '../../../styles/theme/colors';

interface MetricDataPoint {
    timestamp: number;
    value: number;
}

interface MetricsChartProps {
    data: MetricDataPoint[];
    width?: number;
    height?: number;
    lineColor?: string;
    maxDataPoints?: number;
}

export const MetricsChart: React.FC<MetricsChartProps> = ({
    data,
    width = 600,
    height = 300,
    lineColor = COLORS.data.primary,
    maxDataPoints = 100
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const drawChart = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Draw grid
        ctx.strokeStyle = COLORS.background.elevated;
        ctx.lineWidth = 0.5;

        // Calculate metrics
        const dataPoints = data.slice(-maxDataPoints);
        const maxValue = Math.max(...dataPoints.map(d => d.value));
        const minValue = Math.min(...dataPoints.map(d => d.value));

        // Draw data line
        ctx.beginPath();
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 2;

        dataPoints.forEach((point, index) => {
            const x = (index / (dataPoints.length - 1)) * width;
            const y = height - ((point.value - minValue) / (maxValue - minValue)) * height;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.stroke();
    };

    useEffect(() => {
        drawChart();
    }, [data, width, height]);

    return (
        <div className="metrics-chart">
            <canvas
                ref={canvasRef}
                width={width}
                height={height}
                className="metrics-canvas"
            />
        </div>
    );
};