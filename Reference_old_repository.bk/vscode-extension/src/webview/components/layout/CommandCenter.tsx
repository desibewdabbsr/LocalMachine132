import React from 'react';
import { HexGrid } from './../layout/HexGrid';
import { StatusBar } from './../layout/StatusBar';
import '../../styles/theme/colors';
import '../../styles/theme/typography';
import '../../styles/theme/animations';
import './CommandCenter.css';

interface CommandCenterProps {
    children: React.ReactNode;
    systemStatus?: 'operational' | 'warning' | 'critical';
}

export const CommandCenter: React.FC<CommandCenterProps> = ({
    children,
    systemStatus = 'operational'
}) => {
    return (
        <div className="command-center">
            <header className="command-header">
                <div className="system-status">
                    <span className={`status-indicator ${systemStatus}`} />
                    <h1>COMMAND CENTER</h1>
                </div>
                <StatusBar status={systemStatus} />
            </header>
            
            <main className="command-main">
                <HexGrid>
                    {children}
                </HexGrid>
            </main>
        </div>
    );
};