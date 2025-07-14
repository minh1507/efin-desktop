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
  speed = 10, // Faster default speed (was 20ms)
  finished = false,
  onComplete
}) => {
  const [displayedContent, setDisplayedContent] = useState<string>('');
  const [isComplete, setIsComplete] = useState<boolean>(finished);
  const contentRef = useRef<string>('');
  const intervalRef = useRef<number | null>(null);
  const chunkSizeRef = useRef<number>(1); // Number of characters to show per tick
  
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
    let lastTime = Date.now();
    
    // Start the typing animation
    intervalRef.current = window.setInterval(() => {
      const now = Date.now();
      const elapsedTime = now - lastTime;
      
      // Dynamic chunk sizing based on content characteristics
      // For code blocks or long paragraphs, type faster
      if (content.includes('```') || content.length > 500) {
        chunkSizeRef.current = Math.min(10, Math.floor(content.length / 100) + 1);
      } else {
        // For regular text, adapt speed based on time since last update
        chunkSizeRef.current = elapsedTime > 100 ? 3 : 1;
      }
      
      // Adjust chunk size based on natural language breaks
      let nextChunk = Math.min(chunkSizeRef.current, content.length - i);
      
      // Try to find a good breaking point for the next chunk
      if (i + nextChunk < content.length) {
        // Look for natural breaks in the upcoming text
        const nextText = content.substring(i, i + nextChunk * 2);
        const breakChars = [' ', ',', '.', ';', ':', '!', '?', '\n'];
        
        for (const char of breakChars) {
          const breakIndex = nextText.indexOf(char);
          if (breakIndex > 0 && breakIndex < nextChunk * 1.5) {
            nextChunk = breakIndex + 1; // Include the break character
            break;
          }
        }
      }
      
      if (i < content.length) {
        // Advance by the calculated chunk size
        const nextPosition = i + nextChunk;
        setDisplayedContent(content.substring(0, nextPosition));
        i = nextPosition;
        lastTime = now;
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