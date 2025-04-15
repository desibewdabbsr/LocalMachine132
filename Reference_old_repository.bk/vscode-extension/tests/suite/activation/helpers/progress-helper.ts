// tests/suite/activation/helpers/progress-helper.ts
import * as vscode from 'vscode';
import { ProgressTask } from '../types/activation-types';

export const createProgressReporter = () => {
    const progress: vscode.Progress<{ message?: string; increment?: number }> = {
        report: jest.fn()
    };
    
    const token: vscode.CancellationToken = {
        isCancellationRequested: false,
        onCancellationRequested: (listener: (e: any) => any) => ({
            dispose: jest.fn()
        })
    };
    
    return { progress, token };
};