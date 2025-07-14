import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

interface TypingAnimationProps {
  content: string;
  speed?: number;
  finished?: boolean;
  onComplete?: () => void;
}

export const TypingAnimation: React.FC<TypingAnimationProps> = ({
  content,
  speed = 20, // milliseconds per character, adjust for faster/slower typing
  finished = false,
  onComplete
}) => {
  const [displayedContent, setDisplayedContent] = useState<string>('');
  const [isComplete, setIsComplete] = useState<boolean>(finished);
  const contentRef = useRef<string>('');
  const intervalRef = useRef<number | null>(null);
  
  useEffect(() => {
    // Reset animation when content changes
    if (content !== contentRef.current) {
      setDisplayedContent('');
      contentRef.current = content;
      setIsComplete(false);
      
      // Clear any existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    
    if (finished) {
      // Skip animation if finished is true
      setDisplayedContent(content);
      setIsComplete(true);
      if (onComplete) onComplete();
      return;
    }
    
    // If animation is already complete or no content, do nothing
    if (isComplete || !content) return;
    
    let i = displayedContent.length;
    
    // Start the typing animation
    intervalRef.current = window.setInterval(() => {
      if (i < content.length) {
        setDisplayedContent(content.substring(0, i + 1));
        i++;
      } else {
        // Animation complete
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
        setIsComplete(true);
        if (onComplete) onComplete();
      }
    }, speed);
    
    // Cleanup interval on unmount or when dependencies change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [content, displayedContent, finished, onComplete, speed]);
  
  return (
    <div className="prose dark:prose-invert max-w-none">
      <ReactMarkdown>{displayedContent || ' '}</ReactMarkdown>
    </div>
  );
}; 