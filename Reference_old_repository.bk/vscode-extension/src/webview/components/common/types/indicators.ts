import React from 'react';

export interface SystemHealthProps {
    onThreadChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onMemoryAllocationToggle: () => void;
    status?: string;
    metrics?: {
        cpu: number;
        memory: number;
        latency: number;
    };
}