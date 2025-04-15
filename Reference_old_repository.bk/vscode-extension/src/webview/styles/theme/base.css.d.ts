// Method 1: Direct module export
export interface CSSModule {
    [className: string]: string;
}

const styles: CSSModule;
export default styles;

// Method 2: Module augmentation
declare global {
    interface CSSModuleExports {
        [className: string]: string;
    }
}

// declare module '*.css' {
//     const content: CSSModuleExports;
//     export default content;
// }

declare module '../styles/theme/base.css' {
    const styles: { [key: string]: string };
    export default styles;
}

// Global CSS module declaration
declare module '*.css' {
    const content: { [className: string]: string };
    export default content;
}
