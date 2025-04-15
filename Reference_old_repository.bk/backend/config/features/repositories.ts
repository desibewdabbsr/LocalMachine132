import { BASE_PATHS } from '../base/paths';
import { STORAGE_CONFIG } from '../base/storage';
import path from 'path';


const API_BASE_URL = 'http://localhost:3000';

export interface RepositoryConfig {
    paths: {
        root: string;
        contracts: string;
        artifacts: string;
        cache: string;
        tests: string;
    };
    settings: {
        defaultBranch: string;
        maxCacheSize: number;
        backupEnabled: boolean;
        autoCleanup: boolean;
    };
    security: {
        scanOnPush: boolean;
        enforceChecks: boolean;
        vulnerabilityThreshold: 'low' | 'medium' | 'high';
    };
    integration: {
        hardhat: boolean;
        foundry: boolean;
        truffle: boolean;
    };
}

export class RepositoryService {
    private static instance: RepositoryService;
    private config: RepositoryConfig;
    private apiUrl: string;


    private constructor() {
        this.config = {
            paths: {
                root: BASE_PATHS.ROOT,
                contracts: path.join(BASE_PATHS.ROOT, 'contracts'),
                artifacts: path.join(BASE_PATHS.ROOT, 'artifacts'),
                cache: STORAGE_CONFIG.cache.types.contracts,
                tests: BASE_PATHS.TESTS.ROOT
            },
            settings: {
                defaultBranch: 'main',
                maxCacheSize: STORAGE_CONFIG.cache.maxSize,
                backupEnabled: true,
                autoCleanup: true
            },
            security: {
                scanOnPush: true,
                enforceChecks: true,
                vulnerabilityThreshold: 'medium'
            },
            integration: {
                hardhat: true,
                foundry: false,
                truffle: false
            }
        };
        this.apiUrl = API_BASE_URL;

    }

    public static getInstance(): RepositoryService {
        if (!RepositoryService.instance) {
            RepositoryService.instance = new RepositoryService();
        }
        return RepositoryService.instance;
    }

    public async validateRepository(path: string): Promise<boolean> {
        try {
            // Integration with core/project_setup/system_dependency_manager.py
            const response = await fetch(`${this.config.paths.root}/validate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path })
            });
            return response.status === 200;
        } catch (error) {
            return false;
        }
    }



    public async scanRepository(path: string): Promise<{
        status: string;
        vulnerabilities: any[];
        recommendations: string[];
    }> {
        const scanUrl = new URL('/scan', this.apiUrl);
        const response = await fetch(scanUrl.toString(), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                path,
                threshold: this.config.security.vulnerabilityThreshold 
            })
        });

        const data = await response.json() as {
            status: string;
            vulnerabilities: any[];
            recommendations: string[];
        };
        
        return data;
    }



    public async getRepositoryMetrics(): Promise<{
        size: number;
        contracts: number;
        tests: number;
        coverage: number;
    }> {
        const metricsUrl = new URL('/metrics', this.apiUrl);
        const response = await fetch(metricsUrl.toString(), {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json() as {
            size: number;
            contracts: number;
            tests: number;
            coverage: number;
        };
        
        return data;
    }

}

export const repositoryService = RepositoryService.getInstance();