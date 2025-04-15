// tests/mocks/hardware-monitor.mock.ts
export const mockHardwareMetrics = {
    cpu: { usage: 45.5, threads: 8 },
    memory: { used: 8589934592, total: 17179869184 },
    gpu: { usage: 30, memory: 4096 }
};

export const mockSystemMonitor = {
    getCurrentStats: jest.fn().mockResolvedValue(mockHardwareMetrics)
};