import { join } from 'path';
import { BASE_PATHS } from './paths';

// Core API Interfaces
export interface AIEndpoints {
    cody: {
        analyze: string;
        optimize: string;
        secure: string;
    };
    ml: {
        train: string;
        predict: string;
        analyze: string;
    };
    generators: {
        contract: string;
        infrastructure: string;
    };
}

export interface LanguageEndpoints {
    nodejs: {
        setup: string;
        dependencies: string;
        toolchain: string;
    };
    python: {
        venv: string;
        packages: string;
    };
    rust: {
        cargo: string;
        toolchain: string;
    };
    solidity: {
        compile: string;
        deploy: string;
        verify: string;
        hardhat: {
            config: string;
            test: string;
            accounts: string;
        };
    };
    web3: {
        chain: string;
        contracts: string;
        eth: string;
    };
}

export interface MonitoringEndpoints {
    metrics: string;
    alerts: string;
    performance: string;
    resources: string;
    security: string;
}

export interface APIConfig {
    version: string;
    baseUrl: string;
    endpoints: {
        ai: AIEndpoints;
        languages: LanguageEndpoints;
        monitoring: MonitoringEndpoints;
        system: {
            health: string;
            status: string;
            config: string;
        };
    };
    security: {
        rateLimiting: {
            maxRequests: number;
            windowMs: number;
            allowedOverage: number;
        };
        cors: {
            allowedOrigins: string[];
            methods: string[];
            headers: string[];
        };
        authentication: {
            jwtSecret: string;
            tokenExpiry: number;
            refreshEnabled: boolean;
        };
    };
    monitoring: {
        metricsInterval: number;
        alertThresholds: {
            cpu: number;
            memory: number;
            gpu: number;
            network: number;
            storage: number;
        };
        logging: {
            level: string;
            format: string;
            rotation: string;
        };
    };
    paths: {
        logs: string;
        metrics: string;
        cache: string;
        temp: string;
        models: string;
        contracts: string;
    };
}

// API Configuration Implementation
export const API_CONFIG: APIConfig = {
    version: 'v1',
    baseUrl: '/api/v1',
    endpoints: {
        ai: {
            cody: {
                analyze: '/ai/cody/analyze',
                optimize: '/ai/cody/optimize',
                secure: '/ai/cody/secure'
            },
            ml: {
                train: '/ai/ml/train',
                predict: '/ai/ml/predict',
                analyze: '/ai/ml/analyze'
            },
            generators: {
                contract: '/ai/generators/contract',
                infrastructure: '/ai/generators/infrastructure'
            }
        },
        languages: {
            nodejs: {
                setup: '/lang/nodejs/setup',
                dependencies: '/lang/nodejs/deps',
                toolchain: '/lang/nodejs/toolchain'
            },
            python: {
                venv: '/lang/python/venv',
                packages: '/lang/python/packages'
            },
            rust: {
                cargo: '/lang/rust/cargo',
                toolchain: '/lang/rust/toolchain'
            },
            solidity: {
                compile: '/lang/solidity/compile',
                deploy: '/lang/solidity/deploy',
                verify: '/lang/solidity/verify',
                hardhat: {
                    config: '/lang/solidity/hardhat/config',
                    test: '/lang/solidity/hardhat/test',
                    accounts: '/lang/solidity/hardhat/accounts'
                }
            },
            web3: {
                chain: '/lang/web3/chain',
                contracts: '/lang/web3/contracts',
                eth: '/lang/web3/eth'
            }
        },
        monitoring: {
            metrics: '/monitoring/metrics',
            alerts: '/monitoring/alerts',
            performance: '/monitoring/performance',
            resources: '/monitoring/resources',
            security: '/monitoring/security'
        },
        system: {
            health: '/system/health',
            status: '/system/status',
            config: '/system/config'
        }
    },
    security: {
        rateLimiting: {
            maxRequests: 100,
            windowMs: 15 * 60 * 1000,
            allowedOverage: 10
        },
        cors: {
            allowedOrigins: ['http://localhost:3000', 'vscode-webview://*'],
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            headers: ['Content-Type', 'Authorization']
        },
        authentication: {
            jwtSecret: process.env.JWT_SECRET || 'default-secret-key',
            tokenExpiry: 24 * 60 * 60,
            refreshEnabled: true
        }
    },
    monitoring: {
        metricsInterval: 5000,
        alertThresholds: {
            cpu: 80,
            memory: 85,
            gpu: 75,
            network: 90,
            storage: 85
        },
        logging: {
            level: 'info',
            format: 'json',
            rotation: '1d'
        }
    },
    paths: {
        logs: BASE_PATHS.RUNTIME.LOGS,
        metrics: BASE_PATHS.RUNTIME.METRICS,
        cache: BASE_PATHS.RUNTIME.CACHE,
        temp: BASE_PATHS.RUNTIME.TEMP,
        models: join(BASE_PATHS.ROOT, 'models'),
        contracts: join(BASE_PATHS.ROOT, 'contracts')
    }
};

// Validation Functions
export const validateAPIConfig = (): boolean => {
    const { endpoints, security, monitoring, paths } = API_CONFIG;
    
    // Validate all endpoints follow the pattern
    const validateEndpoints = (obj: any): boolean => {
        return Object.values(obj).every(value => {
            if (typeof value === 'string') {
                return value.startsWith('/');
            }
            if (typeof value === 'object') {
                return validateEndpoints(value);
            }
            return true;
        });
    };

    // Validate security settings
    const validateSecurity = (): boolean => {
        const { rateLimiting, cors, authentication } = security;
        return (
            rateLimiting.maxRequests > 0 &&
            rateLimiting.windowMs > 0 &&
            cors.allowedOrigins.length > 0 &&
            cors.methods.length > 0 &&
            authentication.tokenExpiry > 0
        );
    };

    // Validate monitoring settings
    const validateMonitoring = (): boolean => {
        const { metricsInterval, alertThresholds } = monitoring;
        return (
            metricsInterval >= 1000 &&
            Object.values(alertThresholds).every(threshold => 
                threshold >= 0 && threshold <= 100
            )
        );
    };

    // Validate paths
    const validatePaths = (): boolean => {
        return Object.values(paths).every(path => 
            typeof path === 'string' && path.length > 0
        );
    };

    return (
        validateEndpoints(endpoints) &&
        validateSecurity() &&
        validateMonitoring() &&
        validatePaths()
    );
};

export default API_CONFIG;