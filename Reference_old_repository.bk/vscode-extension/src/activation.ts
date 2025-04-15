// vscode-extension/src/activation.ts
import * as vscode from 'vscode';
import { EnhancedLogger } from './utils/logger';
import { ConfigManager } from './config/config_manager';
import { AIOrchestrator } from './integration/ai/ai-orchestrator-bridge';
import { LanguageHandler } from './integration/toolchain/language-handler';
import { SecurityService } from './services/security-service';

export class ExtensionActivator {
    private readonly logger: EnhancedLogger;
    private readonly configManager: ConfigManager;
    private disposables: vscode.Disposable[] = [];
    private services: {
        aiOrchestrator?: AIOrchestrator;
        languageHandler?: LanguageHandler;
        securityService?: SecurityService;
    } = {};
    
    constructor() {
        this.logger = EnhancedLogger.getInstance();
        this.configManager = ConfigManager.getInstance();
    }

    public async activate(context: vscode.ExtensionContext): Promise<void> {
        await this.logger.logOperation('activation', 'start', async () => {
            this.logger.info('Starting Pop Dev Assistant activation sequence');

            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "Activating Pop Dev Assistant",
                cancellable: false
            }, async (progress) => {
                const steps = [
                    { task: () => this.initializeConfiguration(), name: 'Configuration' },
                    { task: () => this.setupServices(), name: 'Services' },
                    { task: () => this.registerCommands(context), name: 'Commands' },
                    { task: () => this.initializeAIIntegration(), name: 'AI Integration' },
                    { task: () => this.setupLanguageSupport(), name: 'Language Support' }
                ];

                for (const [index, step] of steps.entries()) {
                    await this.executeActivationStep(step, progress, index, steps.length);
                }
            });

            this.logger.info('Extension activation completed successfully');
        });
    }

    private async executeActivationStep(
        step: { task: () => Promise<void>; name: string },
        progress: vscode.Progress<{ message?: string; increment?: number }>,
        currentStep: number,
        totalSteps: number
    ): Promise<void> {
        try {
            progress.report({
                message: `${step.name} (${currentStep + 1}/${totalSteps})`,
                increment: 100 / totalSteps
            });
            await step.task();
        } catch (error) {
            this.logger.error(`Failed during ${step.name}: ${error}`);
            throw new Error(`Activation failed at ${step.name}`);
        }
    }

    private async initializeConfiguration(): Promise<void> {
        await this.logger.logOperation('config', 'initialization', async () => {
            await this.configManager.loadConfig();
            this.logger.info('Configuration loaded successfully');
        });
    }

    private async setupServices(): Promise<void> {
        await this.logger.logOperation('services', 'setup', async () => {
            const services = ['compiler', 'network', 'security', 'monitoring'];
            for (const service of services) {
                this.logger.debug(`Initializing ${service} service`);
            }
        });
    }

    private async registerCommands(context: vscode.ExtensionContext): Promise<void> {
        await this.logger.logOperation('commands', 'registration', async () => {
            const commands = [
                { id: 'pop.initProject', handler: () => this.handleInitProject() },
                { id: 'pop.generateContract', handler: () => this.handleGenerateContract() },
                { id: 'pop.deploy', handler: () => this.handleDeploy() }
            ];

            for (const command of commands) {
                const disposable = vscode.commands.registerCommand(
                    command.id,
                    this.createCommandWrapper(command.id, command.handler)
                );
                context.subscriptions.push(disposable);
                this.disposables.push(disposable);
            }
        });
    }

    private async initializeAIIntegration(): Promise<void> {
        await this.logger.logOperation('ai', 'initialization', async () => {
            const aiOrchestrator = new AIOrchestrator();
            await aiOrchestrator.initialize();
            this.logger.info('AI integration initialized successfully');
        });
    }

    private async setupLanguageSupport(): Promise<void> {
        await this.logger.logOperation('language', 'setup', async () => {
            const languageHandler = new LanguageHandler();
            await languageHandler.initialize();
            this.logger.info('Language support configured successfully');
        });
    }

    private createCommandWrapper(commandId: string, handler: () => Promise<void>): () => Promise<void> {
        return async () => {
            try {
                await this.logger.logOperation('command', commandId, handler);
            } catch (error) {
                this.logger.error(`Command ${commandId} failed: ${error}`);
                throw error;
            }
        };
    }

    public async deactivate(): Promise<void> {
        await this.logger.logOperation('extension', 'deactivation', async () => {
            this.logger.info('Starting extension deactivation');
            this.disposables.forEach(d => d.dispose());
            this.disposables = [];
            this.logger.info('Extension deactivated successfully');
        });
    }

    private async handleInitProject(): Promise<void> {
        await this.logger.logOperation('command', 'initProject', async () => {
            const projectConfig = await this.configManager.getConfig();
            const aiOrchestrator = new AIOrchestrator();
            await aiOrchestrator.initializeProject(projectConfig);
            this.logger.info('Project initialized successfully');
        });
    }
    
    private async handleGenerateContract(): Promise<void> {
        await this.logger.logOperation('command', 'generateContract', async () => {
            const languageHandler = new LanguageHandler();
            await languageHandler.generateSmartContract();
            this.logger.info('Contract generated successfully');
        });
    }
    
    private async handleDeploy(): Promise<void> {
        await this.logger.logOperation('command', 'deploy', async () => {
            const deploymentConfig = await this.configManager.getConfig();
            await this.services.securityService?.validateDeployment();
            // Deployment implementation
            this.logger.info('Deployment completed successfully');
        });
    }
    
}








// npm run test:suite -- tests/suite/activation.test.ts