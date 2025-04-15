import React from 'react';
import { VSCodeAPI } from '../../../tests/mockes/vscode-api';

interface ChainSelectorState {
    isLoading: boolean;
}

interface ChainSelectorLoadingProps {
    vscode: VSCodeAPI;
}

export const ChainSelectorLoading: React.FC<ChainSelectorLoadingProps> = ({ vscode }) => {
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const state = vscode.getState<ChainSelectorState>();
        if (state?.isLoading !== undefined) {
            setIsLoading(state.isLoading);
        }
    }, [vscode]);

    return (
        <div className="chain-selector" data-testid="chain-selector">
            {isLoading && (
                <div className="loading-state" data-testid="loading-indicator">
                    Loading networks...
                </div>
            )}
        </div>
    );
};


// npm run test -- tests/suite/webview/components/network/chain-selector.loading.test.tsx