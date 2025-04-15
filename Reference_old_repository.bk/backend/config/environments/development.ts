import { join } from 'path';
import { BASE_PATHS } from '../base/paths';
import { API_CONFIG } from '../base/api';
import { STORAGE_CONFIG } from '../base/storage';

export interface DevelopmentConfig {
    environment: 'development';
    debug: {
        enabled: boolean;
        verboseLogging: boolean;
        aiDebug: boolean;
    };
    paths: {
        python: {
            venvPath: string;
            scriptsPath: string;
            metricsService: string;
            hardwareService: string;
        };
        typescript: {
            servicesPath: string;
            metricsPath: string;
        };
        monitoring: {
            logsPath: string;
            metricsPath: string;
            alertsPath: string;
        };
    };
    services: {
        python: {
            metricsCollection: {
                enabled: boolean;
                interval: number;
                retention: number;
            };
            hardwareMonitoring: {
                enabled: boolean;
                interval: number;
                thresholds: {
                    cpu: number;
                    memory: number;
                    gpu: number;
                };
            };
        };
        typescript: {
            metricsProcessing: {
                batchSize: number;
                workerCount: number;
                compression: boolean;
            };
        };
    };
    ai: {
        cody: {
            debug: boolean;
            modelPath: string;
            maxTokens: number;
            temperature: number;
        };
        llama: {
            enabled: boolean;
            modelConfig: {
                path: string;
                quantization: '4bit' | '8bit';
                contextSize: number;
            };
        };
    };
    security: {
        devMode: {
            allowUnsignedExtensions: boolean;
            disableAuthentication: boolean;
            skipVerification: boolean;
        };
    };
}

export const DEVELOPMENT_CONFIG: DevelopmentConfig = {
    environment: 'development',
    debug: {
        enabled: true,
        verboseLogging: true,
        aiDebug: true
    },
    paths: {
        python: {
            venvPath: join(BASE_PATHS.CORE.LANGUAGE_HANDLERS.PYTHON.ROOT, 'venv'),
            scriptsPath: join(BASE_PATHS.TOOLS.SCRIPTS.ROOT),
            metricsService: join(BASE_PATHS.CORE.MONITORING, 'metrics_service.py'),
            hardwareService: join(BASE_PATHS.CORE.MONITORING, 'hardware_service.py')
        },
        typescript: {
            servicesPath: join(BASE_PATHS.VSCODE.SRC.SERVICES.ROOT),
            metricsPath: join(BASE_PATHS.VSCODE.SRC.SERVICES.ROOT, 'metrics-service.ts')
        },
        monitoring: {
            logsPath: STORAGE_CONFIG.persistence.path,
            metricsPath: STORAGE_CONFIG.metrics.paths.raw,
            alertsPath: join(BASE_PATHS.RUNTIME.LOGS, 'alerts')
        }
    },
    services: {
        python: {
            metricsCollection: {
                enabled: true,
                interval: API_CONFIG.monitoring.metricsInterval,
                retention: STORAGE_CONFIG.cache.retention
            },
            hardwareMonitoring: {
                enabled: true,
                interval: 10000,
                thresholds: API_CONFIG.monitoring.alertThresholds
            }
        },
        typescript: {
            metricsProcessing: {
                batchSize: 100,
                workerCount: 2,
                compression: true
            }
        }
    },
    ai: {
        cody: {
            debug: true,
            modelPath: join(BASE_PATHS.CORE.AI_INTEGRATION.CODY.ROOT, 'models'),
            maxTokens: 2048,
            temperature: 0.7
        },
        llama: {
            enabled: true,
            modelConfig: {
                path: join(BASE_PATHS.CORE.AI_INTEGRATION.ROOT, 'llama_models'),
                quantization: '4bit',
                contextSize: 2048
            }
        }
    },
    security: {
        devMode: {
            allowUnsignedExtensions: true,
            disableAuthentication: true,
            skipVerification: true
        }
    }
};

export const validateDevelopmentConfig = (): boolean => {
    const { paths, services, ai } = DEVELOPMENT_CONFIG;

    // Validate paths
    const validatePaths = (): boolean => {
        return Boolean(
            paths.python.venvPath &&
            paths.python.metricsService &&
            paths.typescript.servicesPath &&
            paths.monitoring.logsPath
        );
    };

    // Validate services
    const validateServices = (): boolean => {
        const { metricsCollection, hardwareMonitoring } = services.python;
        return (
            metricsCollection.interval > 0 &&
            metricsCollection.retention > 0 &&
            hardwareMonitoring.interval > 0 &&
            Object.values(hardwareMonitoring.thresholds).every(t => t >= 0 && t <= 100)
        );
    };

    // Validate AI configurations
    const validateAI = (): boolean => {
        return (
            ai.cody.maxTokens > 0 &&
            ai.cody.temperature >= 0 &&
            ai.cody.temperature <= 1 &&
            ['4bit', '8bit'].includes(ai.llama.modelConfig.quantization)
        );
    };

    return validatePaths() && validateServices() && validateAI();
};

export default DEVELOPMENT_CONFIG;


// npm run test:development