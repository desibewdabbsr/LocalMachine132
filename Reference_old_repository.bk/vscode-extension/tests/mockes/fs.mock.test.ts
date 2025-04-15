import { describe, expect, test, beforeEach } from '@jest/globals';
import { createFsMock } from './fs.mock';

describe('FsMock', () => {
    let fsMock: ReturnType<typeof createFsMock>;

    beforeEach(() => {
        fsMock = createFsMock();
    });

    test('handles file operations', async () => {
        await fsMock.writeJSON('test.json', { data: 'test' });
        await fsMock.appendFile('test.log', 'log entry');
        
        expect(fsMock.writeJSON).toHaveBeenCalled();
        expect(fsMock.appendFile).toHaveBeenCalled();
    });

    test('handles directory operations', async () => {
        await fsMock.mkdir('test-dir');
        await fsMock.ensureDir('nested/dir');
        
        expect(fsMock.mkdir).toHaveBeenCalled();
        expect(fsMock.ensureDir).toHaveBeenCalled();
    });

    test('handles error scenarios', async () => {
        await expect(fsMock.access('error.txt'))
            .rejects.toThrow('ENOENT');
    });
});