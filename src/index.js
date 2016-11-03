'use strict';
const chalk = require('chalk');
const { getJSHints } = require('./hints');
const CustomStats = require('./CustomStats');

module.exports = class PerfHintsPlugin {
    constructor({
        hints = true,
        maxBundleSize = 250
    } = {}) {
        this.hintsFlag = hints;
        this.maxBundleSize = maxBundleSize;
    }

    apply(compiler) {
        if (!this.hintsFlag) {
            return;
        }
        const jsRegex = /\.js($|\?)/i;

        // To tap the Stats Object which changes the output format.
        compiler.plugin('after-emit', (compilation, callback) => {
            compilation.getStats = () => {
                return new CustomStats(compilation, this.maxBundleSize);
            }
            callback();
        });

        compiler.plugin('done', (stats) => {

            console.log(stats.toString({
                colors: true
            }));

            const compilation = stats.compilation;
            const noOfAssets = Object.keys(compilation.assets).length;

            Object.keys(compilation.assets).forEach((file) => {
                const asset = compilation.assets[file];
                const assetSize = asset.source().length;
                let hints = [];
                if (jsRegex.test(file)) {
                    hints.push(...getJSHints(noOfAssets, assetSize, this.maxBundleSize));
                }
                // Patch webpack stats Obj - For Testing Purpose only
                stats.hints = hints;
                console.warn(chalk.yellow(hints.join('')));
            });

        });
    }

}
