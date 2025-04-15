import React from 'react';
import { COLORS } from '../../../styles/theme/colors';
import { ANIMATIONS } from '../../../styles/theme/animations';

interface ToggleSwitchProps {
    isOn: boolean;
    onChange: (value: boolean) => void;
    label?: string;
    variant?: 'primary' | 'warning' | 'critical';
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
    isOn,
    onChange,
    label,
    variant = 'primary'
}) => {
    return (
        <div className="toggle-switch-container">
            {label && <span className="toggle-label">{label}</span>}
            <button 
                className={`toggle-switch ${variant} ${isOn ? 'active' : ''}`}
                onClick={() => onChange(!isOn)}
                role="switch"
                aria-checked={isOn}
            >
                <div className="toggle-slider" />
            </button>
        </div>
    );
};