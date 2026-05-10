import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../state/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className = '', showLabel = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative group flex items-center gap-2 p-2 rounded-xl
        transition-all duration-300 ease-out
        ${isDark 
          ? 'bg-gradient-to-br from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-amber-400' 
          : 'bg-gradient-to-br from-sky-100 to-blue-200 hover:from-sky-50 hover:to-blue-100 text-amber-500'
        }
        border ${isDark ? 'border-slate-700/50' : 'border-sky-300/50'}
        shadow-lg hover:shadow-xl
        hover:scale-105 active:scale-95
        ${className}
      `}
      title={isDark ? 'تفعيل الوضع النهاري' : 'تفعيل الوضع الليلي'}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {/* Glow effect */}
      <span className={`
        absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100
        transition-opacity duration-300
        ${isDark 
          ? 'bg-gradient-to-br from-amber-400/20 to-orange-500/10' 
          : 'bg-gradient-to-br from-yellow-300/30 to-amber-400/20'
        }
      `} />
      
      {/* Icon container with animation */}
      <span className="relative z-10 flex items-center justify-center w-6 h-6">
        {isDark ? (
          <Sun 
            className="w-5 h-5 animate-spin-slow drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" 
            style={{ animationDuration: '20s' }}
          />
        ) : (
          <Moon 
            className="w-5 h-5 drop-shadow-[0_0_6px_rgba(59,130,246,0.5)]"
          />
        )}
      </span>
      
      {showLabel && (
        <span className={`
          relative z-10 text-sm font-medium pr-1
          ${isDark ? 'text-slate-200' : 'text-slate-700'}
        `}>
          {isDark ? 'نهاري' : 'ليلي'}
        </span>
      )}
    </button>
  );
}

export default ThemeToggle;
