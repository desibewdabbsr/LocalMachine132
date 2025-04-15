import * as fs from 'fs-extra';
import * as path from 'path';
import type { LoggerConfig, PerformanceMetric } from './types';
export { BaseLogger as CoreLogger } from './core';


export class BaseLogger {
    protected correlationId: string;
    protected readonly logDir: string;
    protected readonly metricsDir: string;
    private readonly config: LoggerConfig;

    constructor(config: LoggerConfig) {
        this.config = config;
        this.correlationId = this.generateCorrelationId();
        this.logDir = path.join(process.cwd(), 'logs');
        this.metricsDir = path.join(process.cwd(), 'metrics');
        this.initializeDirectories();
    }

    private initializeDirectories(): void {
        fs.ensureDirSync(this.logDir);
        fs.ensureDirSync(this.metricsDir);
    }

    protected generateCorrelationId(): string {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    protected async logMetric(category: string, operation: string, metric: PerformanceMetric): Promise<void> {
        const metricsFile = path.join(this.metricsDir, `${category}-${operation}.json`);
        let metrics = [];
        
        try {
            if (await fs.pathExists(metricsFile)) {
                metrics = await fs.readJSON(metricsFile);
            }
        } catch (error) {
            metrics = [];
        }

        metrics.push({
            timestamp: new Date().toISOString(),
            correlationId: this.correlationId,
            metrics: metric
        });

        await fs.writeJSON(metricsFile, metrics, { spaces: 2 });
    }

    protected async writeLog(logPath: string, content: string): Promise<void> {
        await fs.appendFile(logPath, content + '\n');
    }

    public getConfig(): LoggerConfig {
        return this.config;
    }
}





/*
# Test all logger modules
npm run test:suite -- tests/suite/logger/*.test.ts

# Test specific module
npm run test:suite -- tests/suite/logger/core.test.ts
npm run test:suite -- tests/suite/logger/metrics.test.ts
npm run test:suite -- tests/suite/logger/security.test.ts
npm run test:suite -- tests/suite/logger/index.test.ts
*/