export interface SystemResources {
    cpu: CPUResources;
    memory: MemoryResources;
    disk: DiskResources;
    network: NetworkResources;
    timestamp: number;
}

export interface CPUResources {
    cores: {
        physical: number;
        logical: number;
    };
    architecture: string;
    maxFrequency: number;
    currentLoad: number;
    temperature?: number;
    powerUsage?: number;
}

export interface MemoryResources {
    total: number;
    available: number;
    used: number;
    cached: number;
    buffers: number;
    swapTotal: number;
    swapUsed: number;
    swapFree: number;
}

export interface DiskResources {
    devices: DiskDevice[];
    totalSpace: number;
    usedSpace: number;
    freeSpace: number;
    iops: {
        read: number;
        write: number;
    };
}

export interface DiskDevice {
    name: string;
    mountPoint: string;
    fileSystem: string;
    size: number;
    used: number;
    free: number;
    health: {
        status: 'healthy' | 'warning' | 'critical';
        temperature?: number;
        smartAttributes?: Record<string, unknown>;
    };
}

export interface NetworkResources {
    interfaces: NetworkInterface[];
    totalBandwidth: number;
    usedBandwidth: number;
    latency: number;
}

export interface NetworkInterface {
    name: string;
    ipAddress: string;
    macAddress: string;
    speed: number;
    status: 'up' | 'down';
    metrics: {
        bytesReceived: number;
        bytesSent: number;
        packetsReceived: number;
        packetsSent: number;
        errors: number;
    };
}