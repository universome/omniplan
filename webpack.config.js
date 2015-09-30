var fs = require('fs');
var del = require('del');
var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var PROD = process.env.PROD || false;

if (fs.existsSync('./bin')) del('./bin/**/*') // Clear bin folder first

/* CONFIG FOR DEVELOPMENT */
var devConfig = {
    devtool: '#source-map',
    context: __dirname,
    entry: {
        app: ['client/main.js'],
        vendor: ['react', 'ramda', 'moment', 'flux', 'webpack/hot/dev-server']
    },
    // displayErrorDetails: true,
    output: {
        path: './bin',
        filename: '[name].js'
    },
    resolve: {
        root: [__dirname],
        extensions: ['', '.js', '.css'],
        modulesDirectories: ['node_modules', 'app']
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
                test: /\.css$/,
                loader: ExtractTextPlugin.extract('style-loader', 'css-loader?modules!postcss-loader')
            }
        ]
    },

    devServer: {
        contentBase: "./bin",
        hot: true,
        lazy: false,
        inline: true,
        stats: { colors: true }
    },

    plugins: [
        new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.js'),
        new ExtractTextPlugin('[name].css'),
        new webpack.HotModuleReplacementPlugin()
    ]
};

/* CONFIG FOR PRODUCTION */
var prodConfig = {
    context: __dirname,
    entry: {
        app: ['client/main.js'],
        vendor: ['react', 'ramda', 'moment', 'flux']
    },
    output: {
        path: './bin',
        filename: '[name].js'
    },
    resolve: {
        root: [__dirname],
        extensions: ['', '.js', '.css'],
        modulesDirectories: ['node_modules', 'app']
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /(node_modules)/,
                loader: 'babel'
            },
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract('style-loader', 'css-loader?modules!postcss-loader')
            }
        ]
    },

    plugins: [
        new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.js'),
        new ExtractTextPlugin('[name].css'),
        new webpack.optimize.UglifyJsPlugin({minimize: true})
    ]
}

module.exports = PROD ? prodConfig : devConfig;
