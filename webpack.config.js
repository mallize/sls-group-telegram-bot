const slsw = require('serverless-webpack');
const nodeExternals = require('webpack-node-externals');
const path = require('path');


module.exports = {
    entry: slsw.lib.entries,
    target: 'node',
    mode: 'production',
    optimization: {
        minimize: false
    },
    performance: {
        hints: false
    },
    devtool: 'nosources-source-map',
    stats: 'minimal',
    externals: [nodeExternals()],
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'babel-loader'
                    }
                ],
            }
        ]
    }
};
