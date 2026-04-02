/**
 * EffectsToggle Component
 * 
 * Toggle button for enabling/disabling visual effects.
 * Shows in navbar or settings panel.
 * Connected to EffectsContext for global state management.
 */

import React from 'react';
import { Sparkles, EyeOff } from 'lucide-react';
import { useEffectsContext } from '../../utils/EffectsContext';

interface EffectsToggleProps {
  /** Compact mode for navbar (icon only), full for settings */
  variant?: 'compact' | 'full';
  /** Additional className */
  className?: string;
}

const EffectsToggle: React.FC<EffectsToggleProps> = ({
  variant = 'full',
  className = '',
}) => {
  const { effectsEnabled, setEffectsEnabled } = useEffectsContext();
  
  const handleToggle = () => {
    setEffectsEnabled(!effectsEnabled);
  };

  if (variant === 'compact') {
    return (
      <button
        onClick={handleToggle}
        className={`
          p-2 rounded-lg transition-all duration-200
          ${effectsEnabled 
            ? 'bg-white/10 text-gold hover:bg-white/20' 
            : 'bg-white/5 text-white/40 hover:bg-white/10'
          }
          ${className}
        `}
        title={effectsEnabled ? 'Disable effects' : 'Enable effects'}
        aria-label={effectsEnabled ? 'Disable visual effects' : 'Enable visual effects'}
      >
        {effectsEnabled ? (
          <Sparkles className="w-4 h-4" />
        ) : (
          <EyeOff className="w-4 h-4" />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      className={`
        flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200
        ${effectsEnabled 
          ? 'bg-gold/10 text-gold hover:bg-gold/20 border border-gold/20' 
          : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200 border border-neutral-200'
        }
        ${className}
      `}
      aria-label={effectsEnabled ? 'Disable visual effects' : 'Enable visual effects'}
    >
      {effectsEnabled ? (
        <>
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-medium">Effects On</span>
        </>
      ) : (
        <>
          <EyeOff className="w-4 h-4" />
          <span className="text-sm font-medium">Effects Off</span>
        </>
      )}
    </button>
  );
};

export default EffectsToggle;
