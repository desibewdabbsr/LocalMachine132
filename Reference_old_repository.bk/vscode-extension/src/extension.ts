// src/extension.ts
import * as vscode from 'vscode';
import { ConfigManager } from './config/config_manager';
import { EnhancedLogger } from './utils/logger';
import { CompileCommand } from './commands/contract/compile-command';
import { DeployCommand } from './commands/contract/deploy-command';
import { VerifyCommand } from './commands/contract/verify-command';
import { InitCommand } from './commands/projects/init-command';
import { ConfigCommand } from './commands/projects/config-command';
import type { ExtensionConfig } from '../tests/types';

export async function activate(context: vscode.ExtensionContext) {
    const logger = EnhancedLogger.getInstance();
    
    try {
        await logger.logOperation('extension', 'activation', async () => {
            const commands = {
                'pop.initProject': new InitCommand(context),
                'pop.compileContract': new CompileCommand(context),
                'pop.deployContract': new DeployCommand(context),
                'pop.verifyContract': new VerifyCommand(context),
                'pop.configureProject': new ConfigCommand(context)
            };

            Object.entries(commands).forEach(([commandId, handler]) => {
                const disposable = vscode.commands.registerCommand(commandId, (arg) => 
                    handler.execute(arg)
                );
                context.subscriptions.push(disposable);
            });

            logger.info('Commands registered successfully');
        });
    } catch (error) {
        logger.error(`Extension activation failed: ${error}`);
        throw error;
    }
}



// export async function activate(context: vscode.ExtensionContext) {
//     // Initialize logger
//     const logger = EnhancedLogger.getInstance();
    
//     try {
//         await logger.logOperation('extension', 'activation', async () => {
//             logger.info('Starting Pop Dev Assistant extension activation');

//             // Initialize configuration
//             const config = await initializeConfiguration(logger);
            
//             // Register commands
//             await registerCommands(context, logger, config);
            
//             // Setup workspace
//             await setupWorkspace(context, logger, config);
            
//             logger.info('Extension activation completed successfully');
//         });
//     } catch (error) {
//         logger.error(`Extension activation failed: ${error}`);
//         throw error;
//     }
// }

async function initializeConfiguration(logger: EnhancedLogger): Promise<ExtensionConfig> {
    return await logger.logOperation('config', 'initialization', async () => {
        const configManager = ConfigManager.getInstance();
        const config = await configManager.loadConfig();
        logger.info('Configuration loaded successfully');
        return config;
    });
}


async function registerCommands(
    context: vscode.ExtensionContext, 
    logger: EnhancedLogger,
    config: ExtensionConfig
): Promise<void> {
    await logger.logOperation('commands', 'registration', async () => {
        const commands = [
            'pop.initProject',
            'pop.generateContract',
            'pop.deploy'
        ];

        for (const command of commands) {
            const disposable = vscode.commands.registerCommand(command, () => 
                executeCommand(command, logger)
            );
            context.subscriptions.push(disposable);
        }
        
        logger.info('Commands registered successfully');
    });
}

async function setupWorkspace(
    context: vscode.ExtensionContext,
    logger: EnhancedLogger,
    config: ExtensionConfig
): Promise<void> {
    await logger.logOperation('workspace', 'setup', async () => {
        // Initialize workspace features with progress
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Setting up workspace",
            cancellable: false
        }, async (progress) => {
            const steps = [
                { task: initializeLanguageSupport, name: 'Language Support' },
                { task: setupDebugConfiguration, name: 'Debug Configuration' },
                { task: initializeWebviews, name: 'Webviews' }
            ];

            for (const [index, step] of steps.entries()) {
                progress.report({ 
                    increment: (100 / steps.length),
                    message: `Initializing ${step.name}`
                });
                
                await step.task(context, config);
            }
        });
        
        logger.info('Workspace setup completed');
    });
}

async function executeCommand(command: string, logger: EnhancedLogger): Promise<void> {
    await logger.logOperation('command', command, async () => {
        logger.info(`Executing command: ${command}`);
        // Command implementation
    });
}

// Helper functions
async function initializeLanguageSupport(
    context: vscode.ExtensionContext,
    config: ExtensionConfig
): Promise<void> {
    // Language support initialization
}

async function setupDebugConfiguration(
    context: vscode.ExtensionContext,
    config: ExtensionConfig
): Promise<void> {
    // Debug configuration setup
}

async function initializeWebviews(
    context: vscode.ExtensionContext,
    config: ExtensionConfig
): Promise<void> {
    // Webview initialization
}

export function deactivate() {
    const logger = EnhancedLogger.getInstance();
    logger.info('Extension deactivated');
}





// npm run test:suite -- tests/suite/extension.test.ts
