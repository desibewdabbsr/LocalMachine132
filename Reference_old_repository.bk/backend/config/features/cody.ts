import { BASE_PATHS } from '../base/paths';
import { SYSTEM_RESOURCES } from '../../shared/constants/system.constants';
import { MONITORING_STATUS } from '../../shared/constants/monitoring.constants';
import { ALERT_LEVELS } from '../../shared/constants/alerts.constants';

const API_BASE_URL = 'http://localhost:3000';

export interface CodyConfig {
    api: {
        endpoint: string;
        version: string;
        timeout: number;
        retries: number;
    };
    integration: {
        enabled: boolean;
        features: CodyFeatures;
        modes: CodyModes;
        limits: CodyLimits;
    };
    security: {
        tokenValidation: boolean;
        rateLimit: number;
        maxTokens: number;
    };
}

export interface CodyFeatures {
    codeAnalysis: boolean;
    securityScanning: boolean;
    performanceMonitoring: boolean;
    autoCompletion: boolean;
    documentation: boolean;
}

export interface CodyModes {
    interactive: boolean;
    batch: boolean;
    streaming: boolean;
    debug: boolean;
}

export interface CodyLimits {
    maxRequestSize: number;
    maxConcurrentRequests: number;
    maxAnalysisDepth: number;
    timeoutMs: number;
}

export const CODY_CONFIG: CodyConfig = {
    api: {
        endpoint: 'https://sourcegraph.com/.api/graphql',
        version: '1.0.0',
        timeout: 30000,
        retries: 3
    },
    integration: {
        enabled: true,
        features: {
            codeAnalysis: true,
            securityScanning: true,
            performanceMonitoring: true,
            autoCompletion: true,
            documentation: true
        },
        modes: {
            interactive: true,
            batch: true,
            streaming: true,
            debug: process.env.NODE_ENV === 'development'
        },
        limits: {
            maxRequestSize: 5 * 1024 * 1024,
            maxConcurrentRequests: 10,
            maxAnalysisDepth: 5,
            timeoutMs: 60000
        }
    },
    security: {
        tokenValidation: true,
        rateLimit: 100,
        maxTokens: 1000
    }
};

export class CodyService {
    private static instance: CodyService;
    private readonly config: CodyConfig;
    private readonly basePath: string;
    private readonly apiUrl: string;

    private constructor() {
        this.config = CODY_CONFIG;
        this.basePath = BASE_PATHS.CORE.AI_INTEGRATION.CODY.ROOT;
        this.apiUrl = API_BASE_URL;
    }

    public static getInstance(): CodyService {
        if (!CodyService.instance) {
            CodyService.instance = new CodyService();
        }
        return CodyService.instance;
    }

    public async analyzeCode(path: string): Promise<{
        analysis: any;
        metrics: any;
        recommendations: any;
    }> {
        const analyzeUrl = new URL('/analyze', this.apiUrl);
        
        const pythonAnalysis = await fetch(analyzeUrl.toString(), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ path })
        });

        const response = await pythonAnalysis.json() as {
            analysis: any;
            metrics: any;
            recommendations: any;
        };

        return {
            analysis: response.analysis,
            metrics: response.metrics,
            recommendations: response.recommendations
        };
    }
    

    public async monitorPerformance(): Promise<{
        status: string;
        metrics: any;
        alerts: any;
    }> {
        const performanceData = {
            status: MONITORING_STATUS.STATES.ACTIVE,
            metrics: {
                cpu: SYSTEM_RESOURCES.CPU,
                memory: SYSTEM_RESOURCES.MEMORY
            },
            alerts: {
                level: ALERT_LEVELS.SEVERITY.INFO,
                messages: []
            }
        };

        return performanceData;
    }



    public async validateIntegration(): Promise<boolean> {
        if (!this.config.integration.enabled) {
            return false;
        }

        try {
            const healthUrl = new URL('/health', this.apiUrl);
            const response = await fetch(healthUrl.toString(), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            return response.status === 200;
        } catch (error) {
            return false;
        }
    }
}

export const codyService = CodyService.getInstance();
