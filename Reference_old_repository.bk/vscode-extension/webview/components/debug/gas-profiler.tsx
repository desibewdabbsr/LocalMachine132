import React from 'react';
import { VSCodeAPI } from '../../../tests/mockes/vscode-api';
import { EnhancedLogger } from '../../../src/utils/logger';

interface GasAnalysisState {
    isAnalyzing: boolean;
    currentStep: string;
    functionGasCosts?: Record<string, string>;
    optimizationSuggestions?: string[];
    error?: string;
    progress: number;
}

interface GasProfilerProps {
    vscode: VSCodeAPI;
}

export const GasProfiler: React.FC<GasProfilerProps> = ({ vscode }) => {
    const [state, setState] = React.useState<GasAnalysisState>({
        isAnalyzing: false,
        currentStep: '',
        progress: 0
    });
    const logger = EnhancedLogger.getInstance();

    const startAnalysis = async () => {
        await logger.logOperation('gas-profiler', 'start-analysis', async () => {
            setState(prev => ({ 
                ...prev, 
                isAnalyzing: true, 
                currentStep: 'Initializing analysis',
                progress: 0
            }));
            
            try {
                // Step 1: Contract Loading
                setState(prev => ({ 
                    ...prev, 
                    currentStep: 'Loading contract bytecode',
                    progress: 25
                }));
                vscode.postMessage({ command: 'loadContractBytecode' });

                // Step 2: Function Analysis
                setState(prev => ({ 
                    ...prev, 
                    currentStep: 'Analyzing function gas costs',
                    progress: 50
                }));
                vscode.postMessage({ command: 'analyzeFunctionGas' });

                // Step 3: Optimization Analysis
                setState(prev => ({ 
                    ...prev, 
                    currentStep: 'Generating optimization suggestions',
                    progress: 75
                }));
                vscode.postMessage({ command: 'generateOptimizations' });

            } catch (error: unknown) {
                const errorMessage = error instanceof Error 
                    ? error.message 
                    : 'An unknown error occurred during gas analysis';
                    
                logger.error(`Gas analysis failed: ${errorMessage}`);
                setState(prev => ({ 
                    ...prev, 
                    error: errorMessage,
                    isAnalyzing: false 
                }));
            }
        });
    };

    React.useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            const message = event.data;
            logger.info(`Received gas profiler message: ${message.type}`);

            switch (message.type) {
                case 'functionGasCosts':
                    setState(prev => ({
                        ...prev,
                        functionGasCosts: message.data,
                        progress: 85
                    }));
                    break;
                case 'optimizationSuggestions':
                    setState(prev => ({
                        ...prev,
                        optimizationSuggestions: message.suggestions,
                        isAnalyzing: false,
                        progress: 100
                    }));
                    break;
                case 'analysisError':
                    setState(prev => ({
                        ...prev,
                        error: message.error,
                        isAnalyzing: false
                    }));
                    break;
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    return (
        <div className="gas-profiler" data-testid="gas-profiler">
            <button 
                onClick={startAnalysis}
                disabled={state.isAnalyzing}
                data-testid="analyze-button"
            >
                {state.isAnalyzing ? 'Analyzing...' : 'Analyze Gas Usage'}
            </button>

            {state.isAnalyzing && (
                <div className="analysis-progress" data-testid="analysis-progress">
                    <div className="progress-bar">
                        <div 
                            className="progress-fill" 
                            style={{ width: `${state.progress}%` }}
                        />
                    </div>
                    <span>{state.currentStep}</span>
                </div>
            )}

            {state.functionGasCosts && (
                <div className="gas-breakdown" data-testid="gas-breakdown">
                    <h3>Function Gas Costs</h3>
                    {Object.entries(state.functionGasCosts).map(([func, gas]) => (
                        <div key={func} className="gas-entry">
                            <span>{func}</span>
                            <span>{gas} gas</span>
                        </div>
                    ))}
                </div>
            )}

            {state.optimizationSuggestions && (
                <div className="optimization-suggestions" data-testid="optimization-suggestions">
                    <h3>Optimization Suggestions</h3>
                    <ul>
                        {state.optimizationSuggestions.map((suggestion, index) => (
                            <li key={index}>{suggestion}</li>
                        ))}
                    </ul>
                </div>
            )}

            {state.error && (
                <div className="error-message" data-testid="error-message">
                    {state.error}
                </div>
            )}
        </div>
    );
};


//  npm run test -- tests/suite/webview/components/debug/gas-profiler.test.tsx