const path = require('path');

module.exports = function override(config, env) {
    if (env === 'production') {
        // Add 404.js as an additional entry point
        config.entry = {
            main: './src/index.js', // Default entry point
            notFound: './src/404.js', // Entry point for 404.html
        };

        // Update output filenames
        config.output.filename = 'static/js/[name].[contenthash].js';

        // Add HtmlWebpackPlugin for 404.html
        const HtmlWebpackPlugin = require('html-webpack-plugin');
        config.plugins.push(
            new HtmlWebpackPlugin({
                template: './public/404.html',
                filename: '404.html',
                chunks: ['notFound'], // Include only the 'notFound' chunk
            })
        );
    }
    return config;
};