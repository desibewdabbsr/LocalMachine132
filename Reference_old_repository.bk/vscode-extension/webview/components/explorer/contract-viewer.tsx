import * as React from 'react';
import { VSCodeAPI } from '../../../tests/mockes/vscode-api';

interface ContractViewerProps {
    vscode: VSCodeAPI;
    contractPath: string;
}

export const ContractViewer: React.FC<ContractViewerProps> = ({ vscode, contractPath }) => {
    React.useEffect(() => {
        vscode.postMessage({
            command: 'loadContract',
            payload: { path: contractPath }
        });
    }, [contractPath]);

    return (
        <div className="contract-viewer">
            {/* Contract viewer UI implementation */}
        </div>
    );
};


// npm run test -- tests/suite/webview/components/explorer/contract-viewer.test.tsx