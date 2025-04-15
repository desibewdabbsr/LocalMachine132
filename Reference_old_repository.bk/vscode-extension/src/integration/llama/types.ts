export interface LlamaConfig {
    modelName: string;
    contextSize: number;
    temperature: number;
    maxTokens: number;
    cpuThreads: number;
    batchSize: number;
}

export interface ModelResponse {
    text: string;
    tokens: number;
    metadata: {
        confidence: number;
        processingTime: number;
    }
}

export interface GenerationOptions {
    maxLength?: number;
    temperature?: number;
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
}

export interface LlamaMetrics {
    executionTime: number;
    memoryUsage: {
        heapUsed: number;
        heapTotal: number;
    }
    tokenCount: number;
    modelLatency: number;
}


export interface OllamaResponse {
    text: string;
    usage: {
        total_tokens: number;
        processing_time: number;
    };
    choices: [{
        confidence: number;
    }];
}

export interface OllamaClient {
    generate: (config: any) => Promise<OllamaResponse>;
}



export interface ModelResponse {
    text: string;
    tokens: number;
    metadata: {
        confidence: number;
        processingTime: number;
    }
}

export interface GenerationOptions {
    maxLength?: number;
    temperature?: number;
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
}

export interface OllamaResponse {
    text: string;
    usage: {
        total_tokens: number;
        processing_time: number;
    };
    choices: [{
        confidence: number;
    }];
}

export interface OllamaClient {
    generate: (config: any) => Promise<OllamaResponse>;
}


export interface OptimizationMetrics {
    inferenceTime: number;
    memoryUsage: {
        heapUsed: number;
        heapTotal: number;
    };
    throughput: number;
    modelLatency: number;
}

export interface ModelConfig {
    batchSize: number;
    quantization: 'int8' | 'fp16' | 'fp32';
    threadCount: number;
    memoryLimit: number;
    contextLength: number;
}

export interface OptimizationResult {
    config: ModelConfig;
    metrics: OptimizationMetrics;
    timestamp: number;
}


export interface AccelerationConfig {
    batchSize: number;
    temperature: number;
    cacheTTL: number;
}

export interface InferenceMetrics {
    type: string;
    duration: number;
    memoryUsage: number;
    timestamp: number;
}

export interface CacheEntry {
    result: string;
    timestamp: number;
}



// Performance Tracking Types
export interface PerformanceMetrics {
    duration: number;
    memoryUsage: {
        heapUsed: number;
        heapTotal: number;
        external: number;
        rss: number;
    };
    timestamp: number;
    operationId: string;
    config?: TrackingConfig;
}

export interface TrackingConfig {
    label?: string;
    threshold?: number;
    tags?: string[];
    priority?: 'high' | 'medium' | 'low';
    customMetrics?: Record<string, number>;
}

export interface OperationResult<T> {
    result: T;
    metrics: PerformanceMetrics;
    success: boolean;
}


// Hardware Monitoring Types
export interface HardwareMetrics {
    cpuUsage: number;
    memoryUsage: {
        heapUsed: number;
        heapTotal: number;
        external: number;
        rss: number;
    };
    threadCount: number;
    timestamp: number;
    config?: MonitoringConfig;
}

export interface MonitoringConfig {
    interval?: number;
    thresholds?: {
        cpu: number;
        memory: number;
    };
    retention?: {
        duration: number;
        maxEntries: number;
    };
    tags?: string[];
}

export interface ResourceUsage {
    cpuUsage: number;
    memoryUsage: {
        heapUsed: number;
        heapTotal: number;
        external: number;
        rss: number;
    };
    threadCount: number;
}
