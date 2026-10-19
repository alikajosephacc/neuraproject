import React, { useState, useEffect, useRef } from 'react';

interface DecryptedTextProps {
  text: string;
  speed?: number;
  maxIterations?: number;
  characters?: string;
  className?: string;
  animateOn?: 'hover' | 'view' | 'always';
  revealDirection?: 'start' | 'end' | 'center';
}

const DEFAULT_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=';

/**
 * DecryptedText (from React Bits / 21st.dev)
 * Cyberpunk / telemetry alphanumeric scramble effect.
 * Perfect for corporate jargon decoding and plain-English translation reveal.
 */
export const DecryptedText: React.FC<DecryptedTextProps> = ({
  text,
  speed = 35,
  maxIterations = 10,
  characters = DEFAULT_CHARS,
  className = '',
  animateOn = 'hover',
}) => {
  const [displayText, setDisplayText] = useState(text);
  const [isScrambling, setIsScrambling] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startScramble = () => {
    if (isScrambling) return;
    setIsScrambling(true);

    let iteration = 0;
    const originalText = text;

    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setDisplayText(
        originalText
          .split('')
          .map((char, index) => {
            if (char === ' ') return ' ';
            if (index < iteration) {
              return originalText[index];
            }
            return characters[Math.floor(Math.random() * characters.length)];
          })
          .join('')
      );

      if (iteration >= originalText.length) {
        setIsScrambling(false);
        if (intervalRef.current) clearInterval(intervalRef.current);
      }

      iteration += 1 / (maxIterations / originalText.length || 1);
    }, speed);
  };

  useEffect(() => {
    setDisplayText(text);
    if (animateOn === 'always') {
      startScramble();
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [text, animateOn]);

  return (
    <span
      className={`font-mono inline-block transition-colors ${className}`}
      onMouseEnter={() => {
        if (animateOn === 'hover') startScramble();
      }}
    >
      {displayText}
    </span>
  );
};
