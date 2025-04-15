// Theme System Exports
import { COLORS } from '../styles/theme/colors';
import { TYPOGRAPHY } from '../styles/theme/typography';
import { ANIMATIONS } from '../styles/theme/animations';

import baseStyles from '../styles/theme/base.css';
export { baseStyles };



// import styles from '../styles/theme/base.css';


// Import components explicitly
import { CommandButton } from '../components/common/Controls/CommandButton';
import { ToggleSwitch } from '../components/common/Controls/ToggleSwitch';
import { PerformanceMetric } from '../components/common/indicators/PerformanceMetric';
import { SystemHealth } from '../components/common/indicators/SystemHealth';
import { MetricsChart } from '../components/common/Visualizations/MetricsChart';
import { ResourceMonitor } from '../components/common/Visualizations/ResourceMonitor';
import { HardwareSwitch } from '../components/interactive/ConfigManager/HardwareSwitch.tsx';
import { CommandCenter } from '../components/layout/CommandCenter';
import { HexGrid } from '../components/layout/HexGrid';
import { StatusBar } from '../components/layout/StatusBar';
import { ToolButton } from '../components/common/Controls/ToolButton.tsx.bk';  // Add this

// Core Operational Imports
import { CoreModule } from '../../CoreModule';
import { BaseTemplate } from '../templates/BaseTemplate';
import { CommandPipeline } from '../../commands/CommandPipeline';
import { MetricsDashboard as Dashboard } from '../components/monitoring/Dashboard';

// export const baseStyles = styles;


// Organized System Exports with explicit typing
export const OperationalSystem = {
    Core: {
        CoreModule,
        BaseTemplate,
        CommandPipeline,
        Dashboard
    }
};

export const UISystem = {
    Controls: {
        CommandButton,
        ToggleSwitch,
        ToolButton
    },
    Indicators: {
        PerformanceMetric,
        SystemHealth
    },
    Visualizations: {
        MetricsChart,
        ResourceMonitor
    },
    Interactive: {
        HardwareSwitch
    },
    Layout: {
        CommandCenter,
        HexGrid,
        StatusBar
    }
};

export const ThemeSystem = {
    COLORS,
    TYPOGRAPHY,
    ANIMATIONS,
    baseStyles
};