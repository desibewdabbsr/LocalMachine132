export const TYPOGRAPHY = {
    fonts: {
        command: '"Share Tech Mono", monospace',
        metrics: '"VT323", monospace',
        digital: '"Digital-7", monospace',
        led: '"DSEG7 Classic", monospace'
    },

    sizes: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem'
    },

    weights: {
        normal: 400,
        medium: 500,
        bold: 700
    },

    lineHeights: {
        tight: 1.2,
        normal: 1.5,
        relaxed: 1.75
    }
};

export const FONT_STYLES = {
    commandText: {
        fontFamily: TYPOGRAPHY.fonts.command,
        fontSize: TYPOGRAPHY.sizes.base,
        fontWeight: TYPOGRAPHY.weights.normal,
        lineHeight: TYPOGRAPHY.lineHeights.normal
    },

    metricsDisplay: {
        fontFamily: TYPOGRAPHY.fonts.metrics,
        fontSize: TYPOGRAPHY.sizes.xl,
        fontWeight: TYPOGRAPHY.weights.medium,
        lineHeight: TYPOGRAPHY.lineHeights.tight
    },

    digitalReadout: {
        fontFamily: TYPOGRAPHY.fonts.digital,
        fontSize: TYPOGRAPHY.sizes['2xl'],
        fontWeight: TYPOGRAPHY.weights.normal,
        lineHeight: TYPOGRAPHY.lineHeights.tight
    },

    ledDisplay: {
        fontFamily: TYPOGRAPHY.fonts.led,
        fontSize: TYPOGRAPHY.sizes.xl,
        fontWeight: TYPOGRAPHY.weights.normal,
        lineHeight: TYPOGRAPHY.lineHeights.tight
    }
};