import { TextEncoder, TextDecoder } from 'util';
import { MockVSCodeAPI } from '../mockes/vscode-api';
import 'jest-canvas-mock';


declare global {
    interface Window {
        TextEncoder: typeof TextEncoder;
        TextDecoder: typeof TextDecoder;
        acquireVsCodeApi: () => MockVSCodeAPI;
    }
    
    var TextEncoder: typeof TextEncoder;
    var TextDecoder: {
        new(label?: string, options?: TextDecoderOptions): TextDecoder;
        prototype: TextDecoder;
    };
    var acquireVsCodeApi: () => MockVSCodeAPI;
}

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as unknown as typeof global.TextDecoder;
global.acquireVsCodeApi = () => new MockVSCodeAPI();




// npm run test -- tests/setup/jest.setup.test.ts