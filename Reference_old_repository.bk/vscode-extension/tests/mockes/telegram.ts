// tests/mockes/telegram.ts
import { Context } from 'telegraf';
import { Update, Message } from 'telegraf/typings/core/types/typegram';

export function createMockContext(): Context<Update> {
    const baseContext = {
        me: {
            id: 123456789,
            is_bot: true,
            first_name: 'TestBot',
            username: 'test_bot',
            can_join_groups: true,
            can_read_all_group_messages: true,
            supports_inline_queries: false
        },
        tg: {
            getMe: jest.fn(),
            getUpdates: jest.fn(),
            sendMessage: jest.fn()
        },
        message: {
            message_id: 1,
            date: Date.now(),
            text: '',
            from: {
                id: 7036827196,
                is_bot: false,
                first_name: 'Test',
                language_code: 'en'
            },
            chat: {
                id: 7036827196,
                type: 'private' as const,
                first_name: 'Test'
            }
        } as Message.TextMessage,
        reply: jest.fn(),
        state: {},
        // Add other required Context properties
    };

    return baseContext as unknown as Context<Update>;
}