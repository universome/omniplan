var path = require('path');
var webpack = require('webpack');
var ROOT_DIR = path.join(__dirname, '..');

var config = {
    devtool: '#source-map',
    context: __dirname,
    entry: './main.js',
    // displayErrorDetails: true,
    output: {
        path: path.join(ROOT_DIR, 'dist'),
        filename: 'main.js'
    },
    resolve: {
        root: [__dirname],
        extensions: ['', '.js', '.styl']
    },

    module: {
        preLoaders: [
            {
                test: /\.js$/,
                loader: 'source-map-loader'
            }
        ],
        loaders: [
            {
                test: /\.js$/,
                exclude: /(node_modules)/,
                loader: 'babel'
            },
            {
                test: /\.styl$/,
                loader: 'style-loader!css-loader!stylus-loader'
            }
        ]
    }
};

module.exports = config;
