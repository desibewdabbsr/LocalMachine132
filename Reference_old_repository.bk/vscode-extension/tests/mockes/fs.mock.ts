import { EventEmitter } from 'events';
import { jest } from '@jest/globals';

export class FsWatcher extends EventEmitter {
    close(): void {}
}

export const createFsMock = () => ({
    // Core File Operations
    writeJSON: jest.fn((path: string, data: any) => Promise.resolve()),
    readJSON: jest.fn((_path: unknown) => Promise.resolve([] as any[])),
    appendFile: jest.fn((path: string, data: string) => Promise.resolve()),
    readFile: jest.fn((path: string) => Promise.resolve('')),
    writeFile: jest.fn((path: string, data: any) => Promise.resolve()),
    
    // Directory Operations
    mkdir: jest.fn((path: string) => Promise.resolve()),
    ensureDir: jest.fn((path: string) => Promise.resolve()),
    ensureDirSync: jest.fn((path: string) => undefined),
    readdir: jest.fn((path: string) => Promise.resolve([])),
    
    // Path & Error Handling
    pathExists: jest.fn((path: string) => Promise.resolve(false)),
    access: jest.fn((path: string) => {
        if (path.includes('error')) {
            return Promise.reject(new Error('ENOENT'));
        }
        return Promise.resolve();
    })
});