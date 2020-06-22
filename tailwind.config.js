module.exports = {
    purge: {
        enabled: process.env.NODE_ENV === 'production',
        content: ['src/client/**/*.js'],
    },
    theme: {
        extend: {
            colors: {
                'blue-primary': '#007eff',
                'dark-primary': '#323130',

                'dark-primary-400': '#706F6E',
                'dark-primary-500': '#323130',

                'dark-secondary': '#1B1B1D',
                'blue-darkest': '#18202E',

                'gray-lightest': 'rgba(14, 22, 34, 0.02)',
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
                full: '100%',
                screen: '100vw',
            })
        },
    },
    variants: {},
    plugins: [],
}
