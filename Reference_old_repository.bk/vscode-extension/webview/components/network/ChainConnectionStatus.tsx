import React from 'react';
import { VSCodeAPI } from '../../../tests/mockes/vscode-api';

interface ChainConnectionStatusProps {
    chainId: number;
    status: string;
    vscode: VSCodeAPI;
}

export const ChainConnectionStatus: React.FC<ChainConnectionStatusProps> = ({ 
    chainId, 
    status,
    vscode 
}) => {
    return (
        <span 
            className={`status-indicator ${status}`}
            data-testid={`status-${chainId}`}
        >
            {status}
        </span>
    );
};


// npm run test -- tests/suite/webview/components/network/chainconnectionstatus.test.tsx