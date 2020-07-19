module.exports = {
    purge: {
        enabled: process.env.NODE_ENV === 'production',
        content: ['src/client/**/*.js'],
    },
    theme: {
        extend: {
            colors: {
                'blue-primary': '#2e75d4',
                'dark-primary': '#323130',

                'dark-primary-400': '#706F6E',
                'dark-primary-500': '#323130',

                'dark-secondary': '#1B1B1D',
                'blue-darkest': '#263545',

                'blue-darkest-200': '#192532',

                'blue-darkest-300': '#0c141c',

                'gray-lightest': '#f7f9fa',

                'gray-lighter': '#b4c3ca',

                'gray-lightest-100': '#e5ebed',
                'gray-lightest-200': '#d3dce0',
                'blue-lightest': '#e8f7ff',
            },
            fontFamily: {},
            width: (theme) => ({
                ...theme('spacing'),
                '1/7': '14.30%',
                '6/7': '85.7%',
                '2/6': '33.333333%',
                '3/6': '50%',
                '4/6': '66.666667%',
                '5/6': '83.333333%',
                '1/12': '8.333333%',
                '2/12': '16.666667%',
                '3/12': '25%',
                '4/12': '33.333333%',
                '5/12': '41.666667%',
                '6/12': '50%',
                '7/12': '58.333333%',
                '8/12': '66.666667%',
                '9/12': '75%',
                '10/12': '83.333333%',
                '11/12': '91.666667%',
                '18-percent': '18%',
                '82-percent': '82%',
                full: '100%',
                screen: '100vw',
            }),
            spacing: {
                topbar: '4.375rem',
            },
            boxShadow: {
                'account-menu':
                    'rgba(0, 0, 0, 0.4) 1px 0px 2px 0px inset, rgba(0, 0, 0, 0.35) 2px 0px 5px 0px inset;',
            },
        },
    },
    variants: {},
    plugins: [],
}
