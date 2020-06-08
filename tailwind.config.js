module.exports = {
    purge: {
        enabled: process.env.NODE_ENV === 'production',
        content: ['src/client/**/*.js'],
    },
    theme: {
        extend: {
            colors: {
                'blue-primary': '#0078D4',
                'dark-primary': '#323130',

                'dark-primary-400': '#706F6E',
                'dark-primary-500': '#323130',

                'dark-secondary': '#1B1B1D',
            },
            fontFamily: {},
        },
    },
    variants: {},
    plugins: [],
}
// font-family: "Segoe UI", "Segoe UI Web (West European)", "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif;
