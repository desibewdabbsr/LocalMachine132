import * as vscode from 'vscode';

export interface Command {
    id: string;
    execute: (...args: any[]) => Promise<void>;
}

export interface CommandRegistration {
    command: string;
    callback: (...args: any[]) => any;
    thisArg?: any;
}