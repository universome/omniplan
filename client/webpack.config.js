var path = require('path');
var webpack = require('webpack');
var ROOT_DIR = path.join(__dirname, '..');

var config = {
    devtool: '#source-map',
    context: __dirname,
    entry: __dirname + '/main.jsx',
    output: {
        path: path.join(ROOT_DIR, 'dist'),
        filename: 'main.js'
    },
    resolve: {
        root: [path.join(__dirname), path.join(ROOT_DIR, 'bower_components')],
        extensions: ['', '.js', '.jsx', '.styl']
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
                test: /\.jsx?$/,
                // exclude: /(node_modules|bower_components)/,
                loader: 'babel'
            },
            {
                test: /\.styl$/,
                loader: 'style-loader!css-loader!stylus-loader'
            }
        ]
    }
};

var bowerWebpackPlugin = new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin('bower.json', ['main']);

config.plugins = [new webpack.ResolverPlugin(bowerWebpackPlugin)]

module.exports = config;
