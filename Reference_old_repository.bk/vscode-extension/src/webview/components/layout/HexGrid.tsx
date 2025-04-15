import React from 'react';

interface HexGridProps {
    children: React.ReactNode;
}

export const HexGrid: React.FC<HexGridProps> = ({ children }) => {
    return (
        <div className="hex-grid">
            {children}
        </div>
    );
};