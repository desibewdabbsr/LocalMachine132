import React from 'react';
import { VSCodeAPI } from '../../../tests/mockes/vscode-api';
import { EnhancedLogger } from '../../../src/utils/logger';

interface ChainSelectorProps {
    vscode: VSCodeAPI;
}

interface NetworkChain {
    id: number;
    name: string;
    rpcUrl: string;
    gasPrice?: string;
    status: 'connected' | 'disconnected' | 'connecting' | 'error';
}

interface ChainSelectorState {
    chains: NetworkChain[];
    selectedChain: NetworkChain | null;
    isLoading: boolean;
    error: string | null;
    gasEstimates: Record<number, string>;
    connectionStatus: Record<number, string>;
}

export const ChainSelector: React.FC<ChainSelectorProps> = ({ vscode }) => {
    const [state, setState] = React.useState<ChainSelectorState>({
        chains: [],
        selectedChain: null,
        isLoading: true,
        error: null,
        gasEstimates: {},
        connectionStatus: {}
    });
    const logger = EnhancedLogger.getInstance();

    React.useEffect(() => {
        const currentState = vscode.getState() as ChainSelectorState;
        if (currentState) {
            setState(prev => ({ ...prev, ...currentState }));
        } else {
            setState(prev => ({ ...prev, isLoading: true }));
        }
        initializeChains();
    }, []);



    const initializeChains = async () => {
        await logger.logOperation('network', 'initialize-chains', async () => {
            try {
                setState(prev => ({ ...prev, isLoading: true, error: null }));
                
                vscode.postMessage({
                    command: 'getNetworkChains',
                    payload: {}
                });

                // Initialize default chains
                const defaultChains: NetworkChain[] = [
                    {
                        id: 1,
                        name: 'Ethereum Mainnet',
                        rpcUrl: 'https://mainnet.infura.io/v3/',
                        status: 'disconnected'
                    },
                    {
                        id: 5,
                        name: 'Goerli Testnet',
                        rpcUrl: 'https://goerli.infura.io/v3/',
                        status: 'disconnected'
                    },
                    {
                        id: 1337,
                        name: 'Local Network',
                        rpcUrl: 'http://localhost:8545',
                        status: 'disconnected'
                    }
                ];

                setState(prev => ({
                    ...prev,
                    chains: defaultChains,
                    isLoading: false
                }));

                // Start monitoring gas prices and connection status
                startNetworkMonitoring(defaultChains);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                setState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
                logger.error(`Chain initialization failed: ${errorMessage}`);
            }
        });
    };

    const startNetworkMonitoring = async (chains: NetworkChain[]) => {
        await logger.logOperation('network', 'monitor-networks', async () => {
            for (const chain of chains) {
                monitorGasPrice(chain);
                monitorConnectionStatus(chain);
            }
        });
    };

    const monitorGasPrice = async (chain: NetworkChain) => {
        try {
            vscode.postMessage({
                command: 'getGasPrice',
                payload: { chainId: chain.id }
            });
        } catch (error) {
            logger.error(`Gas price monitoring failed for chain ${chain.id}`);
        }
    };

    const monitorConnectionStatus = async (chain: NetworkChain) => {
        try {
            vscode.postMessage({
                command: 'checkConnection',
                payload: { chainId: chain.id }
            });
        } catch (error) {
            logger.error(`Connection monitoring failed for chain ${chain.id}`);
        }
    };

    const handleChainSelection = async (chain: NetworkChain) => {
        await logger.logOperation('network', 'switch-chain', async () => {
            try {
                setState(prev => ({
                    ...prev,
                    selectedChain: chain
                }));

                vscode.postMessage({
                    command: 'switchChain',
                    payload: { chainId: chain.id }
                });
            } catch (error) {
                logger.error(`Chain switch failed: ${error}`);
            }
        });
    };

    return (
        <div className="chain-selector" data-testid="chain-selector">
            {state.error && (
                <div className="error-message" data-testid="error-message">
                    {state.error}
                </div>
            )}
            
            {state.isLoading ? (
                <div className="loading" data-testid="loading-indicator">
                    Loading networks...
                </div>
            ) : (
                <div className="chains-list">
                    {state.chains.map(chain => (
                        <div
                            key={chain.id}
                            className={`chain-item ${state.selectedChain?.id === chain.id ? 'selected' : ''}`}
                            onClick={() => handleChainSelection(chain)}
                            data-testid={`chain-${chain.id}`}
                        >
                            <div className="chain-info">
                                <span className="chain-name">{chain.name}</span>
                                <span className={`status-indicator ${chain.status}`} data-testid={`status-${chain.id}`}>
                                    {chain.status}
                                </span>
                            </div>
                            {state.gasEstimates[chain.id] && (
                                <div className="gas-price">
                                    Gas: {state.gasEstimates[chain.id]}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};



/*

Network chain validation with real-time status checks
Gas price estimation using web3 providers
Connection status monitoring with websocket support
Smooth chain switching animations using React transitions
Comprehensive error handling with detailed logging
Progress tracking for all operations
Network state persistence


We can later split this into smaller, focused components:

ChainList
GasMonitor
ConnectionStatus
NetworkValidator



chain-selector.status.test.tsx to test the integration 
of ChainConnectionStatus within ChainSelector
*/