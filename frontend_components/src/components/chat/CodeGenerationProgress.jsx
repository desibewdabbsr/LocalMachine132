import React, { useState, useEffect } from 'react';
import './CodeGenerationProgress.css';

/**
 * CodeGenerationProgress Component
 * 
 * Displays an animated progress bar for code generation
 */
const CodeGenerationProgress = ({ isGenerating, initialProgress = 0 }) => {
  const [progress, setProgress] = useState(initialProgress);
  
  useEffect(() => {
    if (!isGenerating) {
      setProgress(0);
      return;
    }
    
    // Reset progress when generation starts
    setProgress(0);
    
    // Create interval to update progress
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + Math.random() * 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          return 100;
        }
        return newProgress;
      });
    }, 200);
    
    // Clean up interval when component unmounts or generation stops
    return () => clearInterval(interval);
  }, [isGenerating]);
  
  if (!isGenerating) {
    return null;
  }
  
  return (
    <div className="generation-progress">
      <div 
        className="progress-bar" 
        style={{ width: `${progress}%` }}
      ></div>
      <div className="progress-text">
        Generating response... {Math.round(progress)}%
      </div>
    </div>
  );
};

export default CodeGenerationProgress;