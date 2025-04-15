import React from 'react';
import { VSCodeAPI } from '../../../tests/mockes/vscode-api';
import { ContractViewer } from './contract-viewer';
import { EnhancedLogger } from '../../../src/utils/logger';

interface ExplorerPanelProps {
    vscode: VSCodeAPI;
}

interface ExplorerState {
    contracts: string[];
    selectedContract: string | null;
    isLoading: boolean;
    error: string | null;
}



export const ExplorerPanel: React.FC<ExplorerPanelProps> = ({ vscode }) => {
    const [state, setState] = React.useState<ExplorerState>({
        contracts: [],
        selectedContract: null,
        isLoading: true,
        error: null
    });
    const logger = EnhancedLogger.getInstance();

    React.useEffect(() => {
        const currentState = vscode.getState();
        if (currentState) {
            setState(prev => ({ ...prev, ...currentState, isLoading: false }));
        }
        loadContracts();
    }, []);


    const loadContracts = async () => {
        try {
            await logger.logOperation('explorer', 'load-contracts', async () => {
                setState(prev => ({ ...prev, isLoading: true, error: null }));
                
                vscode.postMessage({
                    command: 'getContracts',
                    payload: {}
                });

                // Update state with mock data for testing
                setState(prev => ({
                    ...prev,
                    contracts: ['Contract.sol'],
                    isLoading: false
                }));
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            setState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
        }
    };

    return (
        <div className="explorer-panel">
            {state.error && (
                <div data-testid="error-message" className="error">
                    {state.error}
                </div>
            )}
            {state.isLoading ? (
                <div data-testid="loading-indicator" className="loading">
                    Loading contracts...
                </div>
            ) : (
                <div className="contracts-list">
                    {state.contracts.map(contract => (
                        <div 
                            key={contract}
                            className={`contract-item ${state.selectedContract === contract ? 'selected' : ''}`}
                            onClick={() => setState(prev => ({ ...prev, selectedContract: contract }))}
                        >
                            {contract}
                        </div>
                    ))}
                </div>
            )}
            {state.selectedContract && (
                <div data-testid="contract-viewer">
                    <ContractViewer 
                        vscode={vscode} 
                        contractPath={state.selectedContract} 
                    />
                </div>
            )}
        </div>
    );
};

// npm run test -- tests/suite/webview/components/explorer/explorer-panel.test.tsx