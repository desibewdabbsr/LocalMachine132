import { ExtensionContext } from 'vscode';
import { EnhancedLogger } from '../utils/logger';

export class ToolchainService {
    constructor(
        private readonly context: ExtensionContext,
        private readonly logger: EnhancedLogger
    ) {}
}