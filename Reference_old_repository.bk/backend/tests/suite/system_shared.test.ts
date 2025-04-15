import {
    SystemResources,
    CPUResources,
    MemoryResources,
    DiskResources,
    NetworkResources,
    DiskDevice,
    NetworkInterface
} from '../../shared/types/system_shared';

describe('System Resource Type Definitions', () => {
    describe('CPUResources', () => {
        const cpuResources: CPUResources = {
            cores: {
                physical: 4,
                logical: 8
            },
            architecture: 'x86_64',
            maxFrequency: 3600,
            currentLoad: 45.5,
            temperature: 65,
            powerUsage: 65.5
        };

        it('validates CPU resources structure', () => {
            expect(cpuResources.cores.logical).toBeGreaterThanOrEqual(cpuResources.cores.physical);
            expect(cpuResources.currentLoad).toBeLessThanOrEqual(100);
            expect(cpuResources.maxFrequency).toBeGreaterThan(0);
        });
    });

    describe('MemoryResources', () => {
        const memoryResources: MemoryResources = {
            total: 16000000000,
            available: 8000000000,
            used: 8000000000,
            cached: 2000000000,
            buffers: 1000000000,
            swapTotal: 8000000000,
            swapUsed: 1000000000,
            swapFree: 7000000000
        };

        it('validates memory resources structure', () => {
            expect(memoryResources.total).toBeGreaterThan(0);
            expect(memoryResources.used).toBeLessThanOrEqual(memoryResources.total);
            expect(memoryResources.swapUsed).toBeLessThanOrEqual(memoryResources.swapTotal);
        });
    });

    describe('DiskDevice and DiskResources', () => {
        const diskDevice: DiskDevice = {
            name: '/dev/sda1',
            mountPoint: '/',
            fileSystem: 'ext4',
            size: 500000000000,
            used: 250000000000,
            free: 250000000000,
            health: {
                status: 'healthy',
                temperature: 40,
                smartAttributes: {
                    reallocatedSectors: 0,
                    powerOnHours: 1000
                }
            }
        };

        const diskResources: DiskResources = {
            devices: [diskDevice],
            totalSpace: 500000000000,
            usedSpace: 250000000000,
            freeSpace: 250000000000,
            iops: {
                read: 1000,
                write: 500
            }
        };

        it('validates disk resources structure', () => {
            expect(diskResources.devices.length).toBeGreaterThan(0);
            expect(diskResources.totalSpace).toBe(diskDevice.size);
            expect(diskResources.usedSpace).toBeLessThanOrEqual(diskResources.totalSpace);
        });
    });

    describe('NetworkInterface and NetworkResources', () => {
        const networkInterface: NetworkInterface = {
            name: 'eth0',
            ipAddress: '192.168.1.100',
            macAddress: '00:11:22:33:44:55',
            speed: 1000,
            status: 'up',
            metrics: {
                bytesReceived: 1000000,
                bytesSent: 500000,
                packetsReceived: 1000,
                packetsSent: 500,
                errors: 0
            }
        };

        const networkResources: NetworkResources = {
            interfaces: [networkInterface],
            totalBandwidth: 1000,
            usedBandwidth: 100,
            latency: 5
        };

        it('validates network resources structure', () => {
            expect(networkResources.interfaces.length).toBeGreaterThan(0);
            expect(networkResources.usedBandwidth).toBeLessThanOrEqual(networkResources.totalBandwidth);
            expect(networkResources.latency).toBeGreaterThanOrEqual(0);
        });
    });

    describe('Complete SystemResources', () => {
        const systemResources: SystemResources = {
            cpu: {
                cores: { physical: 4, logical: 8 },
                architecture: 'x86_64',
                maxFrequency: 3600,
                currentLoad: 45.5
            },
            memory: {
                total: 16000000000,
                available: 8000000000,
                used: 8000000000,
                cached: 2000000000,
                buffers: 1000000000,
                swapTotal: 8000000000,
                swapUsed: 1000000000,
                swapFree: 7000000000
            },
            disk: {
                devices: [{
                    name: '/dev/sda1',
                    mountPoint: '/',
                    fileSystem: 'ext4',
                    size: 500000000000,
                    used: 250000000000,
                    free: 250000000000,
                    health: { status: 'healthy' }
                }],
                totalSpace: 500000000000,
                usedSpace: 250000000000,
                freeSpace: 250000000000,
                iops: { read: 1000, write: 500 }
            },
            network: {
                interfaces: [{
                    name: 'eth0',
                    ipAddress: '192.168.1.100',
                    macAddress: '00:11:22:33:44:55',
                    speed: 1000,
                    status: 'up',
                    metrics: {
                        bytesReceived: 1000000,
                        bytesSent: 500000,
                        packetsReceived: 1000,
                        packetsSent: 500,
                        errors: 0
                    }
                }],
                totalBandwidth: 1000,
                usedBandwidth: 100,
                latency: 5
            },
            timestamp: Date.now()
        };

        it('validates complete system resources structure', () => {
            expect(systemResources.cpu).toBeDefined();
            expect(systemResources.memory).toBeDefined();
            expect(systemResources.disk).toBeDefined();
            expect(systemResources.network).toBeDefined();
            expect(systemResources.timestamp).toBeLessThanOrEqual(Date.now());
        });
    });
});