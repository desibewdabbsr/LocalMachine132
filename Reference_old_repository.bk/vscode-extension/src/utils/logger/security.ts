import { BaseLogger } from './core';
import type { SecurityAudit, LoggerConfig, PerformanceMetric } from './types';
import * as path from 'path';
import * as fs from 'fs-extra';

export class SecurityLogger extends BaseLogger {
    private readonly securityLogDir: string;

    constructor(config: LoggerConfig) {
        super(config);
        this.securityLogDir = path.join(process.cwd(), 'logs', 'security');
    }

    async logOperation<T>(
        category: string,
        operation: string,
        func: () => Promise<T>
    ): Promise<T> {
        const startTime = Date.now();
        try {
            const result = await func();
            const endTime = Date.now();
            await this.logMetric(category, operation, {
                startTime,
                endTime,
                duration: endTime - startTime,
                success: true,
                metadata: { operation }
            });
            return result;
        } catch (error) {
            const endTime = Date.now();
            await this.logMetric(category, operation, {
                startTime,
                endTime,
                duration: endTime - startTime,
                success: false,
                error,
                metadata: { operation }
            });
            throw error;
        }
    }

    async logSecurityAudit(audit: SecurityAudit): Promise<void> {
        const logEntry = {
            timestamp: new Date().toISOString(),
            correlationId: this.correlationId,
            ...audit
        };
        await this.writeSecurityLog(logEntry);
    }

    private getSecurityLogPath(): string {
        const date = new Date().toISOString().split('T')[0];
        return path.join(this.securityLogDir, `security-audit-${date}.log`);
    }

    private async appendToLog(logPath: string, content: string): Promise<void> {
        await this.ensureLogDirectory();
        await fs.appendFile(logPath, content);
    }

    private async ensureLogDirectory(): Promise<void> {
        await fs.ensureDir(this.securityLogDir);
    }



    private async writeSecurityLog(logEntry: SecurityAudit): Promise<void> {
        const logPath = this.getSecurityLogPath();
        const logContent = JSON.stringify(logEntry) + '\n';
        await fs.appendFile(logPath, logContent);
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