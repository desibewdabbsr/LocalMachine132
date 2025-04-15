// Core interfaces for AI Integration
export interface AIIntegrationPaths {
    ROOT: string;
    CODY: {
        ROOT: string;
        API_CLIENT: string;
        DEFI_ANALYZER: string;
        SECURITY_CHECKER: string;
    };
    ML_ENGINE: {
        ROOT: string;
        DECISION_ENGINE: string;
        MODEL_TRAINER: string;
        REQUIREMENT_ANALYZER: string;
    };
    GENERATORS: {
        ROOT: string;
        CONTRACT_GEN: string;
        INFRASTRUCTURE_GEN: string;
    };
    SECURITY: string;
}

// Language specific paths
export interface LanguageHandlerPaths {
    ROOT: string;
    NODEJS: {
        ROOT: string;
        SETUP: string;
        NPM: string;
        TOOLCHAIN: string;
    };
    PYTHON: {
        ROOT: string;
        PIP: string;
        VENV: string;
    };
    RUST: {
        ROOT: string;
        CARGO: string;
        TOOLCHAIN: string;
        SETUP: string;
    };
    SOLIDITY: {
        ROOT: string;
        CONTRACT: string;
        HARDHAT: {
            ROOT: string;
            ACCOUNT: string;
            COMPILATION: string;
            CONFIG: string;
            SETUP: string;
        };
    };
    WEB3: {
        ROOT: string;
        CHAIN_SETUP: string;
        CONTRACT_VERIFIER: string;
        ETH_HANDLER: string;
    };
    REACT: {
        ROOT: string;
        COMPONENT: string;
        SETUP: string;
    };
}

// VSCode specific interfaces
export interface WorkflowPaths {
    BUILD: {
        ROOT: string;
        MONITORING: string;
        PIPELINE: string;
        TEST: string;
    };
    PRODUCTION: {
        ROOT: string;
        OPTIMIZATION: string;
        RESOURCE: string;
        SECURITY: string;
    };
}
export interface VSCodePaths {
    ROOT: string;
    SRC: {
        ROOT: string;
        COMMANDS: {
            ROOT: string;
            CONTRACT: string;
            PROJECTS: string;
        };
        INTEGRATION: {
            AI: string;
            LLAMA: {
                ROOT: string;
                CORE: string;
                HANDLERS: string;
                OPTIMIZATION: string;
            };
            TOOLCHAIN: string;
        };
        SERVICES: {
            ROOT: string;
            COMPILER: {
                ROOT: string;
                CONTRACT: string;
            };
            NETWORK: {
                ROOT: string;
                PROVIDER: string;
                SERVICE: string;
            };
        };
        WORKFLOW: WorkflowPaths;
    };
    WEBVIEW: {
        ROOT: string;
        COMPONENTS: {
            ROOT: string;
            COMMON: string;
            DEBUG: string;
            DEPLOYMENT: string;
            EXPLORER: string;
            FEATURES: string;
            NETWORK: string;
        };
        TEMPLATES: string;
    };
    TESTS: {
        ROOT: string;
        SUITE: {
            ROOT: string;
            ACTIVATION: string;
            COMMANDS: string;
            INTEGRATION: string;
            WEBVIEW: string;
        };
    };
}


// Test paths interface
export interface TestPaths {
    ROOT: string;
    UNIT: string;
    INTEGRATION: string;
    E2E: string;
    PERFORMANCE: string;
    FUNCTIONAL: string;
    SUITE: {
        ROOT: string;
        CONFIG: string;
        WEBVIEW: string;
        COMMANDS: string;
        ACTIVATION: string;
        INTEGRATION: string;
    };
}

export interface UtilsPaths {
    ROOT: string;
    FILE_OPERATIONS: string;
    LOGGER: string;
}

// Main BasePaths interface
export interface BasePaths {
    ROOT: string;
    BACKEND: string;
    VSCODE_EXTENSION: string;
    CONFIG: {
        ROOT: string;
        TEMPLATES: string;
        SECRETS: string;
        ENV: string;
        NODE_CONFIG: string;
    };
    CORE: {
        AI_INTEGRATION: AIIntegrationPaths;
        LANGUAGE_HANDLERS: LanguageHandlerPaths;
        MONITORING: string;
        PROJECT_SETUP: {
            ROOT: string;
            DEPENDENCY_MANAGER: string;
            ENV_SETUP: string;
            INITIALIZER: string;
            SYSTEM_DEPENDENCY: string;
            TOOLCHAIN_ORCHESTRATOR: string;
        };
    };
    RUNTIME: {
        METRICS: string;
        LOGS: string;
        CACHE: string;
        TEMP: string;
    };

    
    TOOLS: {
        SCRIPTS: {
            ROOT: string;
            DEV_INSTALL: string;
            DOCKER_CLEANUP: string;
            DOCKER_START: string;
            HARDHAT_SETUP: string;
            NODE_SETUP: string;
            RUST_SETUP: string;
        };
        HARDHAT: string;
    };
    TESTS: TestPaths;
    VSCODE: VSCodePaths;
    UTILS: UtilsPaths;
}

export interface PathUtils {
    ensurePaths: () => Promise<void>;
    validatePaths: () => boolean;
}





//
// Add new interface for API storage integration
export interface APIStorageEndpoint {
    cacheDuration: number;
    format: 'json' | 'binary';
}

export interface APIStorageConfig {
    endpoints: {
        [key: string]: APIStorageEndpoint;
    };
    backupPaths: {
        metrics: string;
        cache: string;
    };
}
export interface StorageConfig {
    cache: {
        basePath: string;
        maxSize: number;
        retention: number;
        types: {
            metrics: string;
            contracts: string;
            compiler: string;
            ai: string;
            language: string;
        };
    };
    persistence: {
        type: 'file' | 'memory';
        path: string;
        backupInterval: number;
        formats: {
            metrics: 'json' | 'binary';
            logs: 'text' | 'json';
            cache: 'binary';
        };
    };
    metrics: {
        storageFormat: 'json' | 'binary';
        compressionLevel: number;
        rotationSize: number;
        retentionPeriod: number;
        paths: {
            raw: string;
            processed: string;
            archived: string;
        };
    };
    apiStorage: APIStorageConfig;
}



export interface SystemMetrics {
    cpu: {
        usage: number;
        temperature: number;
        threads: number;
        frequency?: number;
        stats?: {
            contextSwitches: number;
            interrupts: number;
            softInterrupts: number;
            syscalls: number;
        };
    };
    memory: {
        total: number;
        used: number;
        free: number;
        available?: number;
        percent?: number;
        swap?: {
            total: number;
            used: number;
            free: number;
            percent: number;
        };
    };
    timestamp: number;
}

export interface HardwareMetrics {
    gpu: {
        usage: number;
        memory: number;
        temperature: number;
        powerDraw?: number;
        memoryTotal?: number;
        memoryUsed?: number;
        fanSpeed?: number;
    };
    network: {
        bytesReceived: number;
        bytesSent: number;
        packetsReceived?: number;
        packetsSent?: number;
        errors?: {
            input: number;
            output: number;
        };
        drops?: {
            input: number;
            output: number;
        };
    };
    timestamp: number;
}
