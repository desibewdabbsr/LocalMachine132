import { BaseLogger } from './core';
import { MetricsLogger } from './metrics';
import { SecurityLogger } from './security';
import type { LoggerConfig, SecurityAudit, LogLevel } from './types';
import * as path from 'path';
import * as fs from 'fs-extra';

export class EnhancedLogger extends BaseLogger {
    private static instance: EnhancedLogger;
    protected metricsLogger: MetricsLogger;
    protected securityLogger: SecurityLogger;

    private constructor(config: LoggerConfig) {
        super(config);
        this.metricsLogger = new MetricsLogger(config);
        this.securityLogger = new SecurityLogger(config);
    }

    static getInstance(): EnhancedLogger {
        if (!EnhancedLogger.instance) {
            const config: LoggerConfig = {
                logLevel: 'INFO',
                retentionDays: 30,
                metricsEnabled: true
            };
            EnhancedLogger.instance = new EnhancedLogger(config);
        }
        return EnhancedLogger.instance;
    }

    async logOperation<T>(
        component: string,
        operation: string,
        func: () => Promise<T>
    ): Promise<T> {
        return this.metricsLogger.logOperation(component, operation, func);
    }

    async logSecurityAudit(audit: SecurityAudit): Promise<void> {
        return this.securityLogger.logSecurityAudit(audit);
    }

    protected async writeLog(level: LogLevel, message: string): Promise<void> {
        const logEntry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            correlationId: this.correlationId
        };
        await this.outputToLog(JSON.stringify(logEntry));
    }
    
    private async outputToLog(content: string): Promise<void> {
        const logPath = path.join(this.logDir, `app-${new Date().toISOString().split('T')[0]}.log`);
        await fs.appendFile(logPath, content + '\n');
    }
    

    async info(message: string): Promise<void> {
        await this.writeLog('INFO', message);
    }
    
    async warn(message: string): Promise<void> {
        await this.writeLog('WARN', message);
    }
    
    async error(message: string): Promise<void> {
        await this.writeLog('ERROR', message);
    }
    
    async debug(message: string): Promise<void> {
        await this.writeLog('DEBUG', message);
    }
    

}

export * from './types';









/*
# Test all logger modules
npm run test:suite -- tests/suite/logger/*.test.ts

# Test specific module
npm run test:suite -- tests/suite/logger/core.test.ts
npm run test:suite -- tests/suite/logger/metrics.test.ts
npm run test:suite -- tests/suite/logger/security.test.ts
npm run test:suite -- tests/suite/logger/index.test.ts
*/