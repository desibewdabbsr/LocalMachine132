import * as fs from 'fs-extra';
import * as path from 'path';
import { BaseLogger } from './core';
import type { LoggerConfig, PerformanceMetric } from './types';

export class MetricsLogger extends BaseLogger {
    protected readonly metricsDir: string;
    protected memorySnapshots: Map<string, number>;

    constructor(config: LoggerConfig) {
        super(config);
        this.metricsDir = path.join(process.cwd(), 'metrics');
        this.memorySnapshots = new Map();
        fs.ensureDirSync(this.metricsDir);
    }

    async logOperation<T>(
        category: string,
        operation: string,
        func: () => Promise<T>
    ): Promise<T> {
        const startTime = Date.now();
        try {
            const result = await func();
            await this.logMetric(category, operation, {
                startTime,
                endTime: Date.now(),
                duration: Date.now() - startTime,
                success: true
            });
            return result;
        } catch (error) {
            await this.logMetric(category, operation, {
                startTime,
                endTime: Date.now(),
                duration: Date.now() - startTime,
                success: false,
                error
            });
            throw error;
        }
    }

    takeMemorySnapshot(label: string): void {
        this.memorySnapshots.set(label, process.memoryUsage().heapUsed);
    }

    getMemoryDelta(startLabel: string, endLabel: string): number {
        const start = this.memorySnapshots.get(startLabel);
        const end = this.memorySnapshots.get(endLabel);
        return start && end ? end - start : 0;
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