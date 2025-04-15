// Browser-compatible logger for Storybook
export class BrowserLogger {
    private static instance: BrowserLogger;

    static getInstance(): BrowserLogger {
        if (!BrowserLogger.instance) {
            BrowserLogger.instance = new BrowserLogger();
        }
        return BrowserLogger.instance;
    }

    info(message: string): void {
        console.log(`[INFO] ${message}`);
    }

    warn(message: string): void {
        console.warn(`[WARN] ${message}`);
    }

    error(message: string): void {
        console.error(`[ERROR] ${message}`);
    }

    debug(message: string): void {
        console.debug(`[DEBUG] ${message}`);
    }
}