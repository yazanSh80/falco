/**** Tailwind Config - FalcoElectrec Design System ****/
module.exports = {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      /* === COLORS - BZU Blue + Falco Gold + Neutral === */
      colors: {
        brand: {
          DEFAULT: '#136F94',     /* BZU Blue - Primary */
          dark: '#0F506B',        /* BZU Blue Dark */
          light: '#1DA3C6',       /* BZU Blue Light */
          accent: '#D4AF37',      /* Falco Gold - Premium */
          'accent-light': '#F4D675',
          'accent-dark': '#B8952E'
        },
        /* Convenience aliases for gold */
        gold: {
          DEFAULT: '#D4AF37',
          light: '#F4D675',
          dark: '#B8952E'
        },
        page: {
          DEFAULT: '#F4F8FA',     /* Light background */
          alt: '#E8EEF2',         /* Alternate light */
          dark: '#0D1B24',        /* Dark mode */
          'dark-alt': '#16252F'
        },
        text: {
          primary: '#0D1B24',     /* Main text */
          secondary: '#3D5A6A',   /* Secondary text */
          muted: '#93A7B3',       /* Muted/placeholder */
          inverse: '#FFFFFF'      /* On dark backgrounds */
        },
        neutral: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A'
        },
        /* Semantic colors with convenience aliases */
        semantic: {
          success: '#22C55E',
          'success-light': '#DCFCE7',
          warning: '#F59E0B',
          'warning-light': '#FEF3C7',
          error: '#EF4444',
          'error-light': '#FEE2E2',
          info: '#3B82F6',
          'info-light': '#DBEAFE'
        },
        /* Direct aliases for semantic colors */
        success: {
          DEFAULT: '#22C55E',
          light: '#DCFCE7',
          dark: '#16A34A'
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: '#FEF3C7',
          dark: '#D97706'
        },
        error: {
          DEFAULT: '#EF4444',
          light: '#FEE2E2',
          dark: '#DC2626'
        },
        info: {
          DEFAULT: '#3B82F6',
          light: '#DBEAFE',
          dark: '#2563EB'
        }
      },
      /* === TYPOGRAPHY SCALE === */
      fontSize: {
        'display': ['3rem', { lineHeight: '1.1', fontWeight: '700' }],      /* 48px */
        'h1': ['2.25rem', { lineHeight: '1.2', fontWeight: '700' }],        /* 36px */
        'h2': ['1.875rem', { lineHeight: '1.25', fontWeight: '600' }],      /* 30px */
        'h3': ['1.5rem', { lineHeight: '1.3', fontWeight: '600' }],         /* 24px */
        'h4': ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }],        /* 20px */
        'body-lg': ['1.125rem', { lineHeight: '1.6' }],                      /* 18px */
        'body': ['1rem', { lineHeight: '1.6' }],                             /* 16px */
        'body-sm': ['0.875rem', { lineHeight: '1.5' }],                      /* 14px */
        'caption': ['0.75rem', { lineHeight: '1.4' }],                       /* 12px */
        'tiny': ['0.625rem', { lineHeight: '1.3' }]                          /* 10px */
      },
      /* === SPACING SCALE (8px grid) === */
      spacing: {
        '0.5': '0.125rem',  /* 2px */
        '1': '0.25rem',     /* 4px */
        '1.5': '0.375rem',  /* 6px */
        '2': '0.5rem',      /* 8px */
        '2.5': '0.625rem',  /* 10px */
        '3': '0.75rem',     /* 12px */
        '4': '1rem',        /* 16px */
        '5': '1.25rem',     /* 20px */
        '6': '1.5rem',      /* 24px */
        '8': '2rem',        /* 32px */
        '10': '2.5rem',     /* 40px */
        '12': '3rem',       /* 48px */
        '16': '4rem',       /* 64px */
        '20': '5rem',       /* 80px */
        '24': '6rem',       /* 96px */
      },
      /* === GRADIENTS === */
      backgroundImage: {
        'gradient-falco': 'linear-gradient(135deg, #0F506B, #136F94, #1DA3C6)',
        'gradient-hero': 'linear-gradient(135deg, #0F506B 0%, #136F94 50%, #1DA3C6 100%)',
        'gradient-gold': 'linear-gradient(135deg, #D4AF37, #F4D675)',
        'gradient-card': 'linear-gradient(180deg, #FFFFFF 0%, #F4F8FA 100%)',
        'gradient-dark': 'linear-gradient(180deg, #0D1B24 0%, #16252F 100%)'
      },
      /* === SHADOWS === */
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.06)',
        'soft-md': '0 4px 12px rgba(0, 0, 0, 0.08)',
        'soft-lg': '0 8px 24px rgba(0, 0, 0, 0.10)',
        'brand': '0 4px 14px rgba(19, 111, 148, 0.25)',
        'brand-lg': '0 8px 24px rgba(19, 111, 148, 0.30)',
        'gold': '0 4px 14px rgba(212, 175, 55, 0.30)',
        'card': '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.10)',
        'card-hover': '0 10px 25px rgba(0, 0, 0, 0.10)',
        'inner-soft': 'inset 0 2px 4px rgba(0, 0, 0, 0.05)'
      },
      /* === BORDER RADIUS === */
      borderRadius: {
        'sm': '0.25rem',    /* 4px */
        'DEFAULT': '0.5rem', /* 8px */
        'md': '0.625rem',   /* 10px */
        'lg': '0.75rem',    /* 12px */
        'xl': '1rem',       /* 16px */
        '2xl': '1.25rem',   /* 20px */
        '3xl': '1.5rem',    /* 24px */
      },
      /* === ANIMATIONS === */
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'fade-in-up': 'fadeInUp 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-soft': 'pulseSoft 2s infinite',
        'shimmer': 'shimmer 2s infinite linear',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' }
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' }
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        }
      },
      /* === TRANSITIONS === */
      transitionDuration: {
        'fast': '150ms',
        'normal': '200ms',
        'slow': '300ms',
      }
    }
  },
  plugins: []
};
