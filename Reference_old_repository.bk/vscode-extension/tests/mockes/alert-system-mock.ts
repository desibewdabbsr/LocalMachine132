import type { VSCodeAPI } from './vscode-api';
import type { AlertConfig } from '../../webview/components/features/monitoring/alert-system';

export interface AlertMessage {
    command: 'getAlertConfigs' | 'alertTriggered';
    alert?: AlertConfig;
}

export interface AlertResponse {
    configs?: AlertConfig[];
}

export class AlertSystemMockAPI implements VSCodeAPI {
    private state: unknown = {};

    getState<T>(): T {
        return this.state as T;
    }

    setState<T>(state: T): void {
        this.state = state;
    }

    postMessage(message: any): Promise<AlertResponse> {
        if (message.command === 'getAlertConfigs') {
            return Promise.resolve({
                configs: [
                    {
                        severity: 'critical',
                        threshold: 90,
                        metric: 'cpuUsage',
                        enabled: true
                    }
                ]
            });
        }
        return Promise.resolve({});
    }
}