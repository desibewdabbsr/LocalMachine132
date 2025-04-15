import { EnhancedLogger } from '../../../utils/logger';

export class PromptHandler {
    private logger: EnhancedLogger;

    constructor() {
        this.logger = EnhancedLogger.getInstance();
    }

    async process(input: string): Promise<string> {
        this.logger.debug(JSON.stringify({
            message: 'Processing prompt',
            inputLength: input.length
        }));

        if (!input.trim()) {
            this.logger.warn(JSON.stringify({
                message: 'Empty prompt received',
                context: 'PromptHandler'
            }));
            return this.formatPrompt('');
        }

        try {
            const sanitizedInput = this.sanitizeInput(input);
            const formattedPrompt = this.formatPrompt(sanitizedInput);

            this.logger.debug(JSON.stringify({
                message: 'Prompt processed successfully',
                originalLength: input.length,
                processedLength: formattedPrompt.length
            }));

            return formattedPrompt;
        } catch (error) {
            this.logger.error(JSON.stringify({
                message: 'Prompt processing failed',
                error
            }));
            throw error;
        }
    }


    private sanitizeInput(input: string): string {
        // First normalize all line endings
        let processed = input.replace(/\r\n/g, '\n');
        
        // Store code blocks with a unique marker
        const codeBlocks: string[] = [];
        processed = processed.replace(/```([\s\S]*?)```/g, (match) => {
            const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`;
            codeBlocks.push(match);
            return placeholder;
        });
        
        // Store multiline content with markers
        const multilineContent: string[] = [];
        processed = processed.replace(/(.+)\n(.+)/g, (match) => {
            const placeholder = `__MULTILINE_${multilineContent.length}__`;
            multilineContent.push(match);
            return placeholder;
        });
        
        // Process regular text
        processed = processed.trim();
        
        // Restore multiline content first
        multilineContent.forEach((content, index) => {
            processed = processed.replace(
                `__MULTILINE_${index}__`,
                content
            );
        });
        
        // Restore code blocks
        codeBlocks.forEach((block, index) => {
            processed = processed.replace(
                `__CODE_BLOCK_${index}__`,
                block
            );
        });
        
        return processed;
    }
    
    
    private formatPrompt(input: string): string {
        return `### Input:\n${input}\n### Response:`;
    }
    
    
}




// npm run test -- tests/suite/llama/prompt-handler.test.ts