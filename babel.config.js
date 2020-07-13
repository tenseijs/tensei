module.exports = {
    plugins: [
        '@babel/plugin-proposal-class-properties',
        [
            'module-resolver',
            {
                root: ['./src'],
                alias: {
                    pages: './src/client/pages',
                    store: './src/client/store',
                    helpers: './src/client/helpers',
                    components: './src/client/components',
                },
            },
        ],
    ],
    presets: [
        [
            '@babel/preset-env',
            {
                targets: {
                    node: 'current',
                },
            },
        ],
        '@babel/preset-typescript',
        '@babel/preset-react',
    ],
}
