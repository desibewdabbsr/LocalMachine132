import { MockVSCodeAPI } from '../../../tests/mockes/vscode-api';

declare global {
    interface Window {
        acquireVsCodeApi: () => MockVSCodeAPI;
    }
}

window.acquireVsCodeApi = () => new MockVSCodeAPI();