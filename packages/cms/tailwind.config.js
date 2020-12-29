const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
    purge: {
        enabled: process.env.NODE_ENV === 'production',
        content: ['./**/*.(ts|tsx|css)', '../components/**/*.(ts|tsx|css)']
    },
    darkMode: false, // or 'media' or 'class'
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter var', ...defaultTheme.fontFamily.sans]
            },
            colors: {
                'tensei-primary': '#2346F8',

                'tensei-primary-darker': '#243de1',
                'tensei-secondary': '#33C5FF',
                'tensei-darkest': '#21185A',

                'tensei-gray-900': '#61677C',
                'tensei-gray-800': '#D3DCE0',
                'tensei-gray-700': '#949BAF',
                'tensei-gray-600': '#F0F1F4',
                'tensei-gray-400': '#D4D7DF',
                'tensei-gray-300': '#EAEBEF',
                'tensei-gray-100': '#F7F9FA',

                'tensei-warning': '#F0B103',
                'tensei-success': '#00976E',
                'tensei-error': '#D41B44'
            }
        }
    },
    variants: {
        extend: {}
    },
    plugins: [require('@tailwindcss/typography'), require('@tailwindcss/forms')]
}
