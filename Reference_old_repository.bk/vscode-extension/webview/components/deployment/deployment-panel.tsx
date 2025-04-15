import React from 'react';
import { VSCodeAPI } from '../../../tests/mockes/vscode-api';
import { EnhancedLogger } from '../../../src/utils/logger';

interface DeploymentState {
    isDeploying: boolean;
    contractAddress?: string;
    error?: string;
    deploymentStep: string;
    gasEstimate?: string;
    network?: string;
}

interface DeploymentPanelProps {
    vscode: VSCodeAPI;
}

export const DeploymentPanel: React.FC<DeploymentPanelProps> = ({ vscode }) => {
    const [state, setState] = React.useState<DeploymentState>({
        isDeploying: false,
        deploymentStep: 'initial'
    });
    const logger = EnhancedLogger.getInstance();

    const handleDeploy = async () => {
        await logger.logOperation('deployment', 'start', async () => {
            setState(prev => ({ ...prev, isDeploying: true }));
            
            try {
                // Step 1: Compilation Check
                setState(prev => ({ ...prev, deploymentStep: 'compiling' }));
                vscode.postMessage({ command: 'checkCompilation' });

                // Step 2: Network Connection
                setState(prev => ({ ...prev, deploymentStep: 'connecting' }));
                vscode.postMessage({ command: 'connectNetwork' });

                // Step 3: Gas Estimation
                setState(prev => ({ ...prev, deploymentStep: 'estimating' }));
                vscode.postMessage({ command: 'estimateGas' });

                // Step 4: Deployment
                setState(prev => ({ ...prev, deploymentStep: 'deploying' }));
                vscode.postMessage({ command: 'deploy' });

            } catch (error: unknown) {
                const errorMessage = error instanceof Error 
                    ? error.message 
                    : 'An unknown error occurred during deployment';
                    
                logger.error(`Deployment failed: ${errorMessage}`);
                setState(prev => ({ 
                    ...prev, 
                    error: errorMessage,
                    isDeploying: false 
                }));
            }
        });
    };

    React.useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            const message = event.data;
            logger.info(`Received message: ${message.type}`);

            switch (message.type) {
                case 'deploymentSuccess':
                    setState(prev => ({
                        ...prev,
                        contractAddress: message.address,
                        isDeploying: false,
                        deploymentStep: 'completed'
                    }));
                    break;
                case 'deploymentError':
                    setState(prev => ({
                        ...prev,
                        error: message.error,
                        isDeploying: false,
                        deploymentStep: 'failed'
                    }));
                    break;
                case 'gasEstimate':
                    setState(prev => ({
                        ...prev,
                        gasEstimate: message.estimate
                    }));
                    break;
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    return (
        <div className="deployment-panel" data-testid="deployment-panel">
            <div className="deployment-status">
                {state.isDeploying && (
                    <div className="progress-indicator" data-testid="progress-indicator">
                        <span>Step: {state.deploymentStep}</span>
                        {state.gasEstimate && (
                            <span>Estimated Gas: {state.gasEstimate}</span>
                        )}
                    </div>
                )}
                
                {state.error && (
                    <div className="error-message" data-testid="error-message">
                        {state.error}
                    </div>
                )}

                {state.contractAddress && (
                    <div className="success-message" data-testid="success-message">
                        Contract deployed at: {state.contractAddress}
                    </div>
                )}
            </div>

            <button 
                onClick={handleDeploy}
                disabled={state.isDeploying}
                data-testid="deploy-button"
            >
                {state.isDeploying ? 'Deploying...' : 'Deploy Contract'}
            </button>
        </div>
    );
};


// npm run test -- tests/suite/webview/components/deployment/deployment-panel.test.tsx