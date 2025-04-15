export interface HardwareConfig {
    device: 'cpu' | 'cuda';
    threads: number;
    memoryLimit: number;
    batchSize: number;
}

export class HardwareManager {
    private config: HardwareConfig;
    
    constructor() {
        this.config = this.detectOptimalConfig();
    }

    private detectOptimalConfig(): HardwareConfig {
        const hasGPU = this.checkGPUAvailability();
        const cpuThreads = navigator.hardwareConcurrency || 4;
        
        // Default to CPU configuration unless explicitly detected GPU
        return {
            device: hasGPU && process.env.CUDA_VISIBLE_DEVICES ? 'cuda' : 'cpu',
            threads: cpuThreads,
            memoryLimit: hasGPU ? 8192 : 4096,
            batchSize: hasGPU ? 32 : 8
        };
    }

    private checkGPUAvailability(): boolean {
        try {
            // Explicitly check for valid CUDA device
            return process.env.CUDA_VISIBLE_DEVICES !== undefined && 
                   process.env.CUDA_VISIBLE_DEVICES !== '-1' &&
                   process.env.CUDA_VISIBLE_DEVICES !== '';
        } catch {
            return false;
        }
    }

    public getConfig(): HardwareConfig {
        return { ...this.config };
    }

    public toggleDevice(device: 'cpu' | 'cuda'): void {
        this.config.device = device;
        // Update resource allocation based on device
        if (device === 'cuda') {
            this.config.batchSize = 32;
            this.config.memoryLimit = 8192;
        } else {
            this.config.batchSize = 8;
            this.config.memoryLimit = 4096;
        }
    }
}