import { join } from 'path';
import { BasePaths, PathUtils } from '../../types';
import fs from 'fs/promises';
import { statSync } from 'fs';

const ROOT_DIR = process.env.ROOT_DIR || process.cwd();
const BACKEND_DIR = join(ROOT_DIR, 'backend');
const VSCODE_SRC = join(ROOT_DIR, 'vscode-extension', 'src');
const VSCODE_WEBVIEW = join(VSCODE_SRC, 'webview');

export const BASE_PATHS: BasePaths = {
    ROOT: ROOT_DIR,
    BACKEND: BACKEND_DIR,
    VSCODE_EXTENSION: join(ROOT_DIR, 'vscode-extension'),


    // Project Configuration
    CONFIG: {
        ROOT: join(ROOT_DIR, 'config'),
        TEMPLATES: join(ROOT_DIR, 'config', 'templates'),
        SECRETS: join(ROOT_DIR, 'secrets.yaml'),
        ENV: join(ROOT_DIR, 'project-env.sh'),
        NODE_CONFIG: join(ROOT_DIR, 'config', 'templates', 'nodejs_config.yaml')
    },

    // Core Modules with Complete Integration
    CORE: {
        AI_INTEGRATION: {
            ROOT: join(ROOT_DIR, 'core', 'ai_integration'),
            CODY: {
                ROOT: join(ROOT_DIR, 'core', 'ai_integration', 'cody'),
                API_CLIENT: join(ROOT_DIR, 'core', 'ai_integration', 'cody', 'api_client.py'),
                DEFI_ANALYZER: join(ROOT_DIR, 'core', 'ai_integration', 'cody', 'defi_analyzer.py'),
                SECURITY_CHECKER: join(ROOT_DIR, 'core', 'ai_integration', 'cody', 'security_checker.py')
            },
            GENERATORS: {
                ROOT: join(ROOT_DIR, 'core', 'ai_integration', 'generators'),
                CONTRACT_GEN: join(ROOT_DIR, 'core', 'ai_integration', 'generators', 'dynamic_contract_gen.py'),
                INFRASTRUCTURE_GEN: join(ROOT_DIR, 'core', 'ai_integration', 'generators', 'infrastructure_gen.py')
            },
            ML_ENGINE: {
                ROOT: join(ROOT_DIR, 'core', 'ai_integration', 'ml_engine'),
                DECISION_ENGINE: join(ROOT_DIR, 'core', 'ai_integration', 'ml_engine', 'ml_decision_engine.py'),
                MODEL_TRAINER: join(ROOT_DIR, 'core', 'ai_integration', 'ml_engine', 'model_trainer.py'),
                REQUIREMENT_ANALYZER: join(ROOT_DIR, 'core', 'ai_integration', 'ml_engine', 'requirement_analyzer.py')
            },
            SECURITY: join(ROOT_DIR, 'core', 'ai_integration', 'security')
        },
        LANGUAGE_HANDLERS: {
            ROOT: join(ROOT_DIR, 'core', 'language_handlers'),
            NODEJS: {
                ROOT: join(ROOT_DIR, 'core', 'language_handlers', 'nodejs'),
                SETUP: join(ROOT_DIR, 'core', 'language_handlers', 'nodejs', 'node_setup.py'),
                NPM: join(ROOT_DIR, 'core', 'language_handlers', 'nodejs', 'npm_manager.py'),
                TOOLCHAIN: join(ROOT_DIR, 'core', 'language_handlers', 'nodejs', 'toolchain_manager.py')
            },
            PYTHON: {
                ROOT: join(ROOT_DIR, 'core', 'language_handlers', 'python'),
                PIP: join(ROOT_DIR, 'core', 'language_handlers', 'python', 'pip_handler.py'),
                VENV: join(ROOT_DIR, 'core', 'language_handlers', 'python', 'venv_manager.py')
            },
            REACT: {
                ROOT: join(ROOT_DIR, 'core', 'language_handlers', 'react'),
                COMPONENT: join(ROOT_DIR, 'core', 'language_handlers', 'react', 'component_manager.py'),
                SETUP: join(ROOT_DIR, 'core', 'language_handlers', 'react', 'react_setup.py')
            },
            RUST: {
                ROOT: join(ROOT_DIR, 'core', 'language_handlers', 'rust'),
                CARGO: join(ROOT_DIR, 'core', 'language_handlers', 'rust', 'cargo_manager.py'),
                TOOLCHAIN: join(ROOT_DIR, 'core', 'language_handlers', 'rust', 'rust_toolchain_manager.py'),
                SETUP: join(ROOT_DIR, 'core', 'language_handlers', 'rust', 'toolchain_setup.py')
            },
            SOLIDITY: {
                ROOT: join(ROOT_DIR, 'core', 'language_handlers', 'solidity'),
                CONTRACT: join(ROOT_DIR, 'core', 'language_handlers', 'solidity', 'contract_manager.py'),
                HARDHAT: {
                    ROOT: join(ROOT_DIR, 'core', 'language_handlers', 'solidity', 'hardhat'),
                    ACCOUNT: join(ROOT_DIR, 'core', 'language_handlers', 'solidity', 'hardhat', 'account_manager.py'),
                    COMPILATION: join(ROOT_DIR, 'core', 'language_handlers', 'solidity', 'hardhat', 'hardhat_compilation.py'),
                    CONFIG: join(ROOT_DIR, 'core', 'language_handlers', 'solidity', 'hardhat', 'hardhat_config.py'),
                    SETUP: join(ROOT_DIR, 'core', 'language_handlers', 'solidity', 'hardhat', 'hardhat_setup.py')
                }
            },
            WEB3: {
                ROOT: join(ROOT_DIR, 'core', 'language_handlers', 'web3'),
                CHAIN_SETUP: join(ROOT_DIR, 'core', 'language_handlers', 'web3', 'chain_setup.py'),
                CONTRACT_VERIFIER: join(ROOT_DIR, 'core', 'language_handlers', 'web3', 'contract_verifier.py'),
                ETH_HANDLER: join(ROOT_DIR, 'core', 'language_handlers', 'web3', 'eth_handler.py')
            }
        },
        MONITORING: join(ROOT_DIR, 'core', 'monitoring'),
        PROJECT_SETUP: {
            ROOT: join(ROOT_DIR, 'core', 'project_setup'),
            DEPENDENCY_MANAGER: join(ROOT_DIR, 'core', 'project_setup', 'dependency_manager.py'),
            ENV_SETUP: join(ROOT_DIR, 'core', 'project_setup', 'env_setup.py'),
            INITIALIZER: join(ROOT_DIR, 'core', 'project_setup', 'initializer.py'),
            SYSTEM_DEPENDENCY: join(ROOT_DIR, 'core', 'project_setup', 'system_dependency_manager.py'),
            TOOLCHAIN_ORCHESTRATOR: join(ROOT_DIR, 'core', 'project_setup', 'toolchain_setup_orchestrator.py')
        }
    },

    // Testing Paths
    TESTS: {
        ROOT: join(ROOT_DIR, 'tests'),
        UNIT: join(ROOT_DIR, 'tests', 'unit'),
        INTEGRATION: join(ROOT_DIR, 'tests', 'integration'), 
        E2E: join(ROOT_DIR, 'tests', 'e2e'),
        PERFORMANCE: join(ROOT_DIR, 'tests', 'performance'),
        FUNCTIONAL: join(ROOT_DIR, 'tests', 'functional'),
        SUITE: {
            ROOT: join(ROOT_DIR, 'tests', 'suite'),
            CONFIG: join(ROOT_DIR, 'tests', 'suite', 'config'),
            WEBVIEW: join(ROOT_DIR, 'tests', 'suite', 'webview'),
            COMMANDS: join(ROOT_DIR, 'tests', 'suite', 'commands'),
            ACTIVATION: join(ROOT_DIR, 'tests', 'suite', 'activation'),
            INTEGRATION: join(ROOT_DIR, 'tests', 'suite', 'integration')
        }
    },
    

    // Runtime and Data Paths
    RUNTIME: {
        METRICS: join(ROOT_DIR, 'metrics'),
        LOGS: join(ROOT_DIR, 'logs'),
        CACHE: join(ROOT_DIR, '.cache'),
        TEMP: join(ROOT_DIR, '.temp')
    },

    // Development Tools and Scripts
    TOOLS: {
        SCRIPTS: {
            ROOT: join(ROOT_DIR, 'scripts', 'setup'),
            DEV_INSTALL: join(ROOT_DIR, 'scripts', 'setup', 'dev-install.sh'),
            DOCKER_CLEANUP: join(ROOT_DIR, 'scripts', 'setup', 'docker-dev-cleanup.sh'),
            DOCKER_START: join(ROOT_DIR, 'scripts', 'setup', 'docker-dev-start.sh'),
            HARDHAT_SETUP: join(ROOT_DIR, 'scripts', 'setup', 'hardhat-setup.sh'),
            NODE_SETUP: join(ROOT_DIR, 'scripts', 'setup', 'node-setup_volta.sh'),
            RUST_SETUP: join(ROOT_DIR, 'scripts', 'setup', 'rust-setup.sh')
        },
        HARDHAT: join(ROOT_DIR, 'test_hardhat_project')
    },

    // Utils
    UTILS: {
        ROOT: join(ROOT_DIR, 'utils'),
        FILE_OPERATIONS: join(ROOT_DIR, 'utils', 'file_operations.py'),
        LOGGER: join(ROOT_DIR, 'utils', 'logger.py')
    },

    VSCODE: {
        ROOT: join(ROOT_DIR, 'vscode-extension'),
        SRC: {
            ROOT: VSCODE_SRC,
            COMMANDS: {
                ROOT: join(VSCODE_SRC, 'commands'),
                CONTRACT: join(VSCODE_SRC, 'commands', 'contract'),
                PROJECTS: join(VSCODE_SRC, 'commands', 'projects')
            },
            INTEGRATION: {
                AI: join(VSCODE_SRC, 'integration', 'ai'),
                LLAMA: {
                    ROOT: join(VSCODE_SRC, 'integration', 'llama'),
                    CORE: join(VSCODE_SRC, 'integration', 'llama', 'core'),
                    HANDLERS: join(VSCODE_SRC, 'integration', 'llama', 'handlers'),
                    OPTIMIZATION: join(VSCODE_SRC, 'integration', 'llama', 'optimization')
                },
                TOOLCHAIN: join(VSCODE_SRC, 'integration', 'toolchain')
            },
            SERVICES: {
                ROOT: join(VSCODE_SRC, 'services'),
                COMPILER: {
                    ROOT: join(VSCODE_SRC, 'services', 'compiler'),
                    CONTRACT: join(VSCODE_SRC, 'services', 'compiler', 'contract')
                },
                NETWORK: {
                    ROOT: join(VSCODE_SRC, 'services', 'network'),
                    PROVIDER: join(VSCODE_SRC, 'services', 'network', 'provider'),
                    SERVICE: join(VSCODE_SRC, 'services', 'network', 'service')
                }
            },
            WORKFLOW: {
                BUILD: {
                    ROOT: join(VSCODE_SRC, 'workflow', 'build'),
                    MONITORING: join(VSCODE_SRC, 'workflow', 'build', 'monitoring'),
                    PIPELINE: join(VSCODE_SRC, 'workflow', 'build', 'pipeline'),
                    TEST: join(VSCODE_SRC, 'workflow', 'build', 'test')
                },
                PRODUCTION: {
                    ROOT: join(VSCODE_SRC, 'workflow', 'production'),
                    OPTIMIZATION: join(VSCODE_SRC, 'workflow', 'production', 'optimization'),
                    RESOURCE: join(VSCODE_SRC, 'workflow', 'production', 'resource'),
                    SECURITY: join(VSCODE_SRC, 'workflow', 'production', 'security')
                }
            }
        },
        WEBVIEW: {
            ROOT: join(VSCODE_WEBVIEW),
            COMPONENTS: {
                ROOT: join(VSCODE_WEBVIEW, 'components'),
                COMMON: join(VSCODE_WEBVIEW, 'components', 'common'),
                DEBUG: join(VSCODE_WEBVIEW, 'components', 'debug'),
                DEPLOYMENT: join(VSCODE_WEBVIEW, 'components', 'deployment'),
                EXPLORER: join(VSCODE_WEBVIEW, 'components', 'explorer'),
                FEATURES: join(VSCODE_WEBVIEW, 'components', 'features'),
                NETWORK: join(VSCODE_WEBVIEW, 'components', 'network')
            },
            TEMPLATES: join(VSCODE_WEBVIEW, 'templates')
        },
        TESTS: {
            ROOT: join(ROOT_DIR, 'vscode-extension', 'tests'),
            SUITE: {
                ROOT: join(ROOT_DIR, 'vscode-extension', 'tests', 'suite'),
                ACTIVATION: join(ROOT_DIR, 'vscode-extension', 'tests', 'suite', 'activation'),
                COMMANDS: join(ROOT_DIR, 'vscode-extension', 'tests', 'suite', 'commands'),
                INTEGRATION: join(ROOT_DIR, 'vscode-extension', 'tests', 'suite', 'integration'),
                WEBVIEW: join(ROOT_DIR, 'vscode-extension', 'tests', 'suite', 'webview')
            }
        }
    }
}   


export const pathUtils: PathUtils = {
    ensurePaths: async () => {
        const criticalPaths = [
            BASE_PATHS.CORE.AI_INTEGRATION.ROOT,
            BASE_PATHS.CORE.MONITORING,
            BASE_PATHS.RUNTIME.LOGS,
            BASE_PATHS.RUNTIME.METRICS,
            BASE_PATHS.CONFIG.ROOT
        ];

        for (const path of criticalPaths) {
            await fs.mkdir(path, { recursive: true });
        }
    },

    validatePaths: () => {
        const requiredPaths = [
            BASE_PATHS.ROOT,
            BASE_PATHS.BACKEND,
            BASE_PATHS.CONFIG.ROOT,
            BASE_PATHS.CORE.MONITORING
        ];

        return requiredPaths.every(path => {
            try {
                return statSync(path).isDirectory();
            } catch {
                return false;
            }
        });
    }
};

export default { BASE_PATHS, pathUtils };



// npm run test:paths 