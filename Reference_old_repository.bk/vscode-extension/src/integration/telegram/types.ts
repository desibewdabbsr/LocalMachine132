// src/integration/telegram/types.ts
export interface TelegramMockLogger {
    info: jest.MockedFunction<(message: string) => Promise<void>>;
    error: jest.MockedFunction<(message: string) => Promise<void>>;
    logOperation: jest.MockedFunction<
        <T>(category: string, operation: string, func: () => Promise<T>) => Promise<T>
    >;
    warn: jest.MockedFunction<(message: string) => Promise<void>>;
    debug: jest.MockedFunction<(message: string) => Promise<void>>;
}

export interface TelegramCommandResponse {
    status: 'success' | 'error';
    message: string;
    data?: any;
}

export interface TelegramBotConfig {
    token: string;
    chatId?: number;
    commandPrefix?: string;
}



export interface TelegramContext {
    message: {
        text: string;
        chat: {
            id: number;
            first_name?: string;
            last_name?: string;
            type: string;
        };
    };
    reply: jest.Mock;
}

export interface CommandHandlerConfig {
    botToken: string;
    adminChatId?: number;
    commandPrefix?: string;
}