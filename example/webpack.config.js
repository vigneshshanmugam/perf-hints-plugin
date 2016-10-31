const path = require('path');
const webpack = require('webpack');
const Perf = require('../src/index');

const conf = {
    entry: path.join(__dirname, 'input.js'),
    output: {
        path: __dirname,
        filename: 'bundle.js',
        libraryTarget: 'umd'
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            output: {
                comments: false
            }
        }),
        new Perf({
            maxBundleSize: 0.5
        })
    ]
}

module.exports = conf;
