module.exports = {
    purge: {
        enabled: process.env.NODE_ENV === 'production',
        content: ['src/client/**/*.js'],
    },
    theme: {
        extend: {
            colors: {
                'blue-primary': '#0078D4',
            },
        },
    },
    variants: {},
    plugins: [],
}
