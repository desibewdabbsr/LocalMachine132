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

declare module '*.css' {
    const content: CSSModuleExports;
    export default content;
}