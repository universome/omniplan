var path = require('path');
var webpack = require('webpack');

var config = {
    devtool: '#source-map',
    context: __dirname,
    entry: {
        app: ['client/main.js'],
        vendor: ['react', 'ramda', 'moment', 'flux', 'webpack/hot/dev-server']
    },
    // displayErrorDetails: true,
    output: {
        path: './bin',
        filename: 'main.js'
    },
    resolve: {
        root: [__dirname],
        extensions: ['', '.js', '.styl'],
        modulesDirectories: ['node_modules', 'client']
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
    },

    devServer: {
        contentBase: "./bin",
        hot: true,
        lazy: false,
        inline: true
    },

    plugins: [
        new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.bundle.js'),
        new webpack.HotModuleReplacementPlugin()
    ]
};

module.exports = config;
