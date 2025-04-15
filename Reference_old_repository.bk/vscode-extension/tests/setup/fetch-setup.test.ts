const { setupFetch } = require('./fetch-setup');

// Initialize fetch globals before tests
setupFetch();

describe('Fetch Setup', () => {
    test('Response is globally available', () => {
        const response = new Response('test data', { status: 200 });
        expect(response).toBeInstanceOf(Response);
        expect(response.status).toBe(200);
    });

    test('fetch is globally available', () => {
        expect(fetch).toBeDefined();
        expect(typeof fetch).toBe('function');
    });

    test('Response handles JSON data', async () => {
        const testData = { message: 'success' };
        const response = new Response(JSON.stringify(testData));
        const data = await response.json();
        expect(data).toEqual(testData);
    });
});