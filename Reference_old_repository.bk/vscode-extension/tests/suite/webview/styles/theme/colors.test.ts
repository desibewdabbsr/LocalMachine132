import { COLORS } from '../../../../../src/webview/styles/theme/colors';

describe('Color System', () => {
    test('primary colors are correctly defined', () => {
        expect(COLORS.primary.main).toBe('#036635');
        expect(COLORS.primary.light).toBe('#047a40');
        expect(COLORS.primary.dark).toBe('#024d28');
    });

    test('status colors match design system', () => {
        expect(COLORS.status.operational).toBe('#00FF00');
        expect(COLORS.status.warning).toBe('#FFD700');
        expect(COLORS.status.critical).toBe('#FF0000');
    });
});


// npm run test -- tests/suite/webview/styles/theme/colors.test.ts