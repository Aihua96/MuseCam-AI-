import React, { useEffect, useState } from 'react';
import { PromptData } from '../types';

interface Props {
  prompt: PromptData | null;
}

export const PromptOverlay: React.FC<Props> = ({ prompt }) => {
  const [visible, setVisible] = useState(false);
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    if (prompt) {
      setDisplayText(prompt.text);
      setVisible(true);
      // Auto-hide old prompts if needed, but keeping it sticky until next one is usually better for interviews
    }
  }, [prompt]);

  if (!prompt || !visible) return null;

  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-[85%] z-20 pointer-events-none">
      <div className="animate-fade-in-up flex flex-col items-center">
        <div className="bg-white/80 backdrop-blur-md px-6 py-4 rounded-3xl shadow-lg border border-white/50 text-center">
          <p className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-500 to-violet-500">
            {displayText}
          </p>
        </div>
        <div className="mt-2 text-xs font-semibold text-white/90 drop-shadow-md tracking-wider uppercase">
          AI Interviewer
        </div>
      </div>
    </div>
  );
};
