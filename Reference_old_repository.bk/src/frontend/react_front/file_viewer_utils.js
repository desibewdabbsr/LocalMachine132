/**
 * Utility functions for the Holographic File Viewer
 */
class FileViewerUtils {
    /**
     * Log an error with consistent formatting
     * @param {string} context - The context where the error occurred
     * @param {Error|string} error - The error object or message
     */
    static logError(context, error) {
        console.error(`[FileViewer] ${context}:`, error);
    }

    /**
     * Safely get file extension
     * @param {string} filename - The filename
     * @returns {string} - The file extension
     */
    static getFileExtension(filename) {
        if (!filename) return '';
        return filename.split('.').pop().toLowerCase();
    }

    /**
     * Validate file data
     * @param {Object} fileData - The file data to validate
     * @returns {boolean} - Whether the file data is valid
     */
    static validateFileData(fileData) {
        if (!fileData) return false;
        if (!fileData.name) return false;
        return true;
    }

    /**
     * Create a DOM element with error message
     * @param {string} message - The error message
     * @returns {HTMLElement} - The error element
     */
    static createErrorElement(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'file-error';
        errorDiv.textContent = message;
        return errorDiv;
    }

    /**
     * Create a DOM element with success message
     * @param {string} message - The success message
     * @returns {HTMLElement} - The message element
     */
    static createMessageElement(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'file-message';
        messageDiv.textContent = message;
        return messageDiv;
    }
}

// Make sure the class is available globally
window.FileViewerUtils = FileViewerUtils;