import * as vscode from 'vscode';
import { Command, CommandRegistration } from './command-types';
import { EnhancedLogger } from '../utils/logger';

export class CommandManager {
    private readonly commands: Map<string, Command> = new Map();

    constructor(
        private readonly context: vscode.ExtensionContext,
        private readonly logger: EnhancedLogger
    ) {}

    public registerCommand(command: Command): void {
        this.commands.set(command.id, command);
        const registration = vscode.commands.registerCommand(command.id, command.execute);
        this.context.subscriptions.push(registration);
        this.logger.info(`Registered command: ${command.id}`);
    }

    public async executeCommand(id: string, ...args: any[]): Promise<void> {
        const command = this.commands.get(id);
        if (!command) {
            throw new Error(`Command not found: ${id}`);
        }
        await command.execute(...args);
    }

    public dispose(): void {
        this.commands.clear();
    }
}