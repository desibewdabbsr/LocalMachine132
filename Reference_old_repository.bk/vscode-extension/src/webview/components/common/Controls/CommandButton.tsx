import React from 'react';
import { COLORS } from '../../../styles/theme/colors';
import { ANIMATIONS } from '../../../styles/theme/animations';

interface CommandButtonProps {
    label: string;
    variant?: 'primary' | 'warning' | 'critical';
    size?: 'small' | 'medium' | 'large';
    isActive?: boolean;
    onClick?: () => void;
    style?: React.CSSProperties;
}

export const CommandButton: React.FC<CommandButtonProps> = ({
    label,
    variant = 'primary',
    size = 'medium',
    isActive = false,
    onClick
}) => {
    return (
        <button 
            className={`command-button ${variant} ${size} ${isActive ? 'active' : ''}`}
            onClick={onClick}
            style={{
                backgroundColor: COLORS.primary.main,
                borderColor: COLORS.primary.light
            }}
        >
            <span className="button-label">{label}</span>
            {isActive && <div className="active-indicator" />}
        </button>
    );
};