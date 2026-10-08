const c = (name) => `rgb(var(--${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: c('base'),
        surface: c('surface'),
        raised: c('raised'),
        line: c('line'),
        ink: c('ink'),
        muted: c('muted'),
        accent: c('accent'),
        'accent-ink': c('accent-ink'),
        danger: '#e5484d',
        success: '#30a46c',
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['"Instrument Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      keyframes: {
        blink: { '0%,49%': { opacity: 1 }, '50%,100%': { opacity: 0 } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
      },
      animation: { blink: 'blink 1.1s steps(1) infinite', float: 'float 7s ease-in-out infinite' },
    },
  },
  plugins: [],
};
