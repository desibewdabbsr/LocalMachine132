import React from 'react';
import { VSCodeAPI } from '../../../tests/mockes/vscode-api';
import { EnhancedLogger } from '../../../src/utils/logger';

interface DebuggerState {
    isDebugging: boolean;
    transactionHash?: string;
    currentStep: number;
    error?: string;
    stackTrace?: string[];
    memoryDump?: string;
    gasUsed?: string;
    sourceMapping?: {
        line: number;
        column: number;
        file: string;
    };
}

interface TransactionDebuggerProps {
    vscode: VSCodeAPI;
}

export const TransactionDebugger: React.FC<TransactionDebuggerProps> = ({ vscode }) => {
    const [state, setState] = React.useState<DebuggerState>({
        isDebugging: false,
        currentStep: 0
    });
    const logger = EnhancedLogger.getInstance();

    const handleDebug = async (txHash: string) => {
        await logger.logOperation('debugger', 'start', async () => {
            setState(prev => ({ ...prev, isDebugging: true }));
            
            try {
                // Step 1: Load Transaction
                setState(prev => ({ ...prev, currentStep: 1 }));
                logger.info(`Loading transaction: ${txHash}`);
                vscode.postMessage({ command: 'loadTransaction', payload: txHash });

                // Step 2: Fetch Source Maps
                setState(prev => ({ ...prev, currentStep: 2 }));
                logger.info('Fetching source maps');
                vscode.postMessage({ command: 'fetchSourceMaps' });

                // Step 3: Initialize Debugger
                setState(prev => ({ ...prev, currentStep: 3 }));
                logger.info('Initializing debugger');
                vscode.postMessage({ command: 'initializeDebugger' });

                // Step 4: Start Trace
                setState(prev => ({ ...prev, currentStep: 4 }));
                logger.info('Starting transaction trace');
                vscode.postMessage({ command: 'startTrace' });

            } catch (error: unknown) {
                const errorMessage = error instanceof Error 
                    ? error.message 
                    : 'An unknown error occurred during debugging';
                    
                logger.error(`Debugging failed: ${errorMessage}`);
                setState(prev => ({ 
                    ...prev, 
                    error: errorMessage,
                    isDebugging: false 
                }));
            }
        });
    };

    React.useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            const message = event.data;
            logger.info(`Received debugger message: ${message.type}`);

            switch (message.type) {
                case 'stackTrace':
                    setState(prev => ({
                        ...prev,
                        stackTrace: message.data
                    }));
                    break;
                case 'memoryState':
                    setState(prev => ({
                        ...prev,
                        memoryDump: message.data
                    }));
                    break;
                case 'gasUsage':
                    setState(prev => ({
                        ...prev,
                        gasUsed: message.data
                    }));
                    break;
                case 'sourceMapping':
                    setState(prev => ({
                        ...prev,
                        sourceMapping: message.data
                    }));
                    break;
                case 'debugComplete':
                    setState(prev => ({
                        ...prev,
                        isDebugging: false
                    }));
                    break;
                case 'debugError':
                    setState(prev => ({
                        ...prev,
                        error: message.error,
                        isDebugging: false
                    }));
                    break;
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    return (
        <div className="transaction-debugger" data-testid="transaction-debugger">
            <div className="debug-controls">
                <input 
                    type="text"
                    placeholder="Enter transaction hash"
                    data-testid="tx-hash-input"
                    onChange={(e) => setState(prev => ({ 
                        ...prev, 
                        transactionHash: e.target.value 
                    }))}
                />
                <button 
                    onClick={() => state.transactionHash && handleDebug(state.transactionHash)}
                    disabled={state.isDebugging || !state.transactionHash}
                    data-testid="debug-button"
                >
                    {state.isDebugging ? 'Debugging...' : 'Start Debug'}
                </button>
            </div>

            {state.isDebugging && (
                <div className="debug-progress" data-testid="debug-progress">
                    <div className="step-indicator">Step {state.currentStep}/4</div>
                    {state.stackTrace && (
                        <div className="stack-trace" data-testid="stack-trace">
                            <h3>Stack Trace</h3>
                            <pre>{state.stackTrace.join('\n')}</pre>
                        </div>
                    )}
                    {state.memoryDump && (
                        <div className="memory-state" data-testid="memory-state">
                            <h3>Memory State</h3>
                            <pre>{state.memoryDump}</pre>
                        </div>
                    )}
                    {state.gasUsed && (
                        <div className="gas-usage" data-testid="gas-usage">
                            <h3>Gas Used</h3>
                            <span>{state.gasUsed}</span>
                        </div>
                    )}
                </div>
            )}

            {state.error && (
                <div className="error-message" data-testid="error-message">
                    {state.error}
                </div>
            )}

            {state.sourceMapping && (
                <div className="source-mapping" data-testid="source-mapping">
                    <h3>Source Location</h3>
                    <p>
                        File: {state.sourceMapping.file}
                        Line: {state.sourceMapping.line}
                        Column: {state.sourceMapping.column}
                    </p>
                </div>
            )}
        </div>
    );
};


// npm run test -- tests/suite/webview/components/debug/transaction-debugger.test.tsx