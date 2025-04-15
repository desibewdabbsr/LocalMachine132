import { TYPOGRAPHY, FONT_STYLES } from '../../../../../src/webview/styles/theme/typography';

describe('Typography System', () => {
    test('font families are correctly defined', () => {
        expect(TYPOGRAPHY.fonts.command).toContain('Share Tech Mono');
        expect(TYPOGRAPHY.fonts.metrics).toContain('VT323');
    });

    test('font styles are properly composed', () => {
        expect(FONT_STYLES.commandText.fontFamily).toBe(TYPOGRAPHY.fonts.command);
        expect(FONT_STYLES.digitalReadout.fontSize).toBe(TYPOGRAPHY.sizes['2xl']);
    });
});