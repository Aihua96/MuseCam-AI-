import React from 'react';
import { AspectRatio } from '../types';

interface Props {
  selected: AspectRatio;
  onChange: (ratio: AspectRatio) => void;
  disabled?: boolean;
}

export const AspectRatioSelector: React.FC<Props> = ({ selected, onChange, disabled }) => {
  const options = [
    { value: AspectRatio.NineSixteen, label: '9:16', icon: '📱' },
    { value: AspectRatio.ThreeFour, label: '3:4', icon: '🎞️' },
    { value: AspectRatio.OneOne, label: '1:1', icon: '🟦' },
    { value: AspectRatio.SixteenNine, label: '16:9', icon: '💻' },
  ];

  return (
    <div className="flex space-x-2 bg-white/50 backdrop-blur-md p-1.5 rounded-2xl shadow-sm border border-white/60">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          disabled={disabled}
          className={`
            px-3 py-2 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2
            ${
              selected === opt.value
                ? 'bg-white text-rose-500 shadow-md transform scale-105'
                : 'text-slate-500 hover:bg-white/40 hover:text-slate-700'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <span>{opt.icon}</span>
          <span className="hidden sm:inline">{opt.label}</span>
        </button>
      ))}
    </div>
  );
};
