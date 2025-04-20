/**
 * File Utilities
 * 
 * Helper functions for file operations
 */

/**
 * Get appropriate icon for a file based on its extension
 * Icons are sized to match the text and use consistent styling
 * 
 * @param {string} fileName - The file name
 * @returns {string} Icon emoji
 */
export function getFileIcon(fileName) {
  const extension = fileName.split('.').pop().toLowerCase();
  
  const iconMap = {
    // Code files
    js: '📄 JS',
    jsx: '📄 JSX',
    ts: '📄 TS',
    tsx: '📄 TSX',
    py: '📄 PY',
    java: '📄 JAVA',
    c: '📄 C',
    cpp: '📄 C++',
    cs: '📄 C#',
    go: '📄 GO',
    rs: '📄 RS',
    php: '📄 PHP',
    rb: '📄 RB',
    
    // Web files
    html: '📄 HTML',
    css: '📄 CSS',
    scss: '📄 SCSS',
    sass: '📄 SASS',
    less: '📄 LESS',
    
    // Data files
    json: '📄 JSON',
    xml: '📄 XML',
    yaml: '📄 YAML',
    yml: '📄 YML',
    csv: '📄 CSV',
    
    // Document files
    md: '📄 MD',
    txt: '📄 TXT',
    pdf: '📄 PDF',
    doc: '📄 DOC',
    docx: '📄 DOCX',
    
    // Image files
    jpg: '🖼️',
    jpeg: '🖼️',
    png: '🖼️',
    gif: '🖼️',
    svg: '🖼️',
    
    // Config files
    gitignore: '⚙️',
    env: '⚙️',
    
    // Blockchain files
    sol: '📄 SOL',
  };
  
  // Special cases for specific filenames
  if (fileName === 'package.json') return '📦';
  if (fileName === '.gitignore') return '⚙️';
  if (fileName === 'README.md') return '📖';
  if (fileName === 'LICENSE') return '📜';
  
  return iconMap[extension] || '📄';
}

/**
 * Format file size in human-readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get file type from extension
 * @param {string} fileName - The file name
 * @returns {string} File type
 */
export function getFileType(fileName) {
  const extension = fileName.split('.').pop().toLowerCase();
  
  const typeMap = {
    // Code files
    js: 'JavaScript',
    jsx: 'React JSX',
    ts: 'TypeScript',
    tsx: 'React TSX',
    py: 'Python',
    java: 'Java',
    c: 'C',
    cpp: 'C++',
    cs: 'C#',
    go: 'Go',
    rs: 'Rust',
    php: 'PHP',
    rb: 'Ruby',
    
    // Web files
    html: 'HTML',
    css: 'CSS',
    scss: 'SCSS',
    sass: 'SASS',
    less: 'LESS',
    
    // Data files
    json: 'JSON',
    xml: 'XML',
    yaml: 'YAML',
    yml: 'YAML',
    csv: 'CSV',
    
    // Document files
    md: 'Markdown',
    txt: 'Text',
    pdf: 'PDF',
    doc: 'Word',
    docx: 'Word',
    
    // Image files
    jpg: 'JPEG Image',
    jpeg: 'JPEG Image',
    png: 'PNG Image',
    gif: 'GIF Image',
    svg: 'SVG Image',
    
    // Blockchain files
    sol: 'Solidity',
  };
  
  return typeMap[extension] || 'File';
}