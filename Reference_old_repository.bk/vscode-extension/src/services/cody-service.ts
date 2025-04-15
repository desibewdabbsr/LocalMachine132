import { ExtensionContext } from 'vscode';
import { EnhancedLogger } from '../utils/logger';

export class CodyService {
    constructor(
        private readonly context: ExtensionContext,
        private readonly logger: EnhancedLogger
    ) {}

    public getDependencies(): string[] {
        return ['metricsService'];
    }

    public isInitialized(): boolean {
        return true;
    }
}
