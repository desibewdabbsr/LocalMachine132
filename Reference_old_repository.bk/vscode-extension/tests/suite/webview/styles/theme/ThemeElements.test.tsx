/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { COLORS } from '../../../../../src/webview/styles/theme/colors';
import { TYPOGRAPHY, FONT_STYLES } from '../../../../../src/webview/styles/theme/typography';
import { ANIMATIONS } from '../../../../../src/webview/styles/theme/animations';

describe('Theme Elements System', () => {
    describe('Color System', () => {
        test('primary colors maintain correct values', () => {
            expect(COLORS.primary.main).toBe('#036635');
            expect(COLORS.primary.light).toBe('#047a40');
            expect(COLORS.primary.dark).toBe('#024d28');
        });

        test('status colors are properly defined', () => {
            expect(COLORS.status.operational).toBe('#00FF00');
            expect(COLORS.status.warning).toBe('#FFD700');
            expect(COLORS.status.critical).toBe('#FF0000');
        });

        test('background layers provide proper depth', () => {
            const layers = COLORS.background;
            expect(layers.deep).toBe('#0A0A0A');
            expect(layers.surface).toBe('#121212');
            expect(layers.elevated).toBe('#1E1E1E');
        });
    });

    describe('Typography System', () => {
        test('font families are correctly assigned', () => {
            expect(TYPOGRAPHY.fonts.command).toContain('Share Tech Mono');
            expect(TYPOGRAPHY.fonts.metrics).toContain('VT323');
        });

        test('font styles maintain hierarchy', () => {
            const { commandText, metricsDisplay } = FONT_STYLES;
            expect(commandText.fontSize).toBe(TYPOGRAPHY.sizes.base);
            expect(metricsDisplay.fontSize).toBe(TYPOGRAPHY.sizes.xl);
        });
    });

    describe('Animation System', () => {
        test('pulse animations are properly configured', () => {
            expect(ANIMATIONS.pulse.operational).toContain('pulse-green');
            expect(ANIMATIONS.pulse.warning).toContain('pulse-yellow');
            expect(ANIMATIONS.pulse.critical).toContain('pulse-red');
        });

        test('transition timings are consistent', () => {
            const { transition } = ANIMATIONS;
            expect(transition.fast).toBe('0.2s');
            expect(transition.normal).toBe('0.3s');
            expect(transition.slow).toBe('0.5s');
        });
    });
});