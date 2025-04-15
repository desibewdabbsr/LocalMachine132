import { ExtensionContext } from 'vscode';
import { EnhancedLogger } from '../utils/logger';

export class MetricsService {
    constructor(
        private readonly context: ExtensionContext,
        private readonly logger: EnhancedLogger
    ) {}

    public isInitialized(): boolean {
        return true;
    }
}