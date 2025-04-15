import React from 'react';

interface StatusBarProps {
    status: 'operational' | 'warning' | 'critical';
}

export const StatusBar: React.FC<StatusBarProps> = ({ status }) => {
    return (
        <div className="status-bar" role="status">
            <span className={`status-text ${status}`}>
                System Status: {status.toUpperCase()}
            </span>
        </div>
    );
};
