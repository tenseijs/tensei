const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  purge: {
    enabled: process.env.NODE_ENV === 'production',
    content: ['./**/*.tsx']
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', ...defaultTheme.fontFamily.sans],
        mono: ['DM Mono', ...defaultTheme.fontFamily.mono]
      },
      maxHeight: {
        '(screen-16)': 'calc(100vh - 4rem)'
      },
      height: {
        'screen-16': 'calc(100vh - 4rem)'
      },
      inset: {
        16: '4rem'
      },
      transitionProperty: {
        padding: 'padding'
      },
      colors: {
        'tensei-primary': '#2346F8',
        'tensei-primary-200': '#D3D8FA',

        'tensei-primary-lighter': '#3f70fa',

        'tensei-primary-darker': '#243de1',
        'tensei-secondary': '#33C5FF',
        'tensei-darkest': '#21185A',

        'tensei-gray-900': '#4A5568',
        'tensei-gray-800': '#61677C',
        'tensei-gray-700': '#949BAF',
        'tensei-gray-600': '#EEEFF1',
        'tensei-gray-500': '#A0AEC0',
        'tensei-gray-400': '#F0F1F4',
        'tensei-gray-300': '#EAEBEF',
        'tensei-gray-100': '#F7F9FA',
        'tensei-gray-bg': '#EEF1F4',

        'tensei-warning': '#F0B103',
        'tensei-success': '#00976E',
        'tensei-success-lighter': '#00CA93',
        'tensei-success-darker': '#006449',
        'tensei-error': '#D41B44'
      }
    }
  },
  variants: {
    extend: {}
  },
  plugins: [require('@tailwindcss/typography'), require('@tailwindcss/forms')]
}
