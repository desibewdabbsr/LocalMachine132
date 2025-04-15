export const ANIMATIONS = {
    // Pulse Animations
    pulse: {
        operational: 'pulse-green 2s infinite',
        warning: 'pulse-yellow 2s infinite',
        critical: 'pulse-red 1s infinite'
    },

    // Power-up Sequences
    powerUp: {
        duration: '0.8s',
        timing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        sequence: 'power-up 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
    },

    // Status Transitions
    transition: {
        fast: '0.2s',
        normal: '0.3s',
        slow: '0.5s'
    }
};