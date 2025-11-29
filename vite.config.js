import vue from '@vitejs/plugin-vue';

/** @type {import('vite').UserConfig} */
export default {
    plugins: [vue()],
    build: {
        assetsDir: '',
        rollupOptions: {
            input: {
                'app': 'resources/js/app.js',
                'styles': 'resources/css/app.css',
                'styles-dark': 'resources/css/app-dark.css',
            },
            output: {
                entryFileNames: '[name].js',
                chunkFileNames: '[name].js',
                assetFileNames: '[name].[ext]',
            },
        },
    },
    resolve: {
        alias: {
            '@': '/resources/js',
        },
    },
};
