import { EnhancedLogger } from '../../../utils/logger';

export class ResponseProcessor {
    private logger: EnhancedLogger;

    constructor() {
        this.logger = EnhancedLogger.getInstance();
    }

    async process(response: string): Promise<string> {
        // Single argument logging with JSON stringified metadata
        this.logger.debug(JSON.stringify({
            message: 'Processing response',
            responseLength: response.length
        }));

        if (!response) {
            this.logger.warn(JSON.stringify({
                message: 'Empty response received',
                context: 'ResponseProcessor'
            }));
            return '';
        }

        try {
            const processedResponse = this.cleanResponse(response);
            
            this.logger.debug(JSON.stringify({
                message: 'Response processed successfully',
                originalLength: response.length,
                processedLength: processedResponse.length
            }));

            return processedResponse;
        } catch (error) {
            this.logger.error(JSON.stringify({
                message: 'Response processing failed',
                error
            }));
            throw error;
        }
    }

    private cleanResponse(response: string): string {
        let cleaned = response;
        // Handle multiple response markers recursively
        while (cleaned.includes('### Response:')) {
            cleaned = cleaned.replace(/^### Response:/i, '').trim();
        }
        return cleaned;
    }
    
}




// npm run test -- tests/suite/llama/response-processor.test.ts