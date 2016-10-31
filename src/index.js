'use strict';
const chalk = require('chalk');
const { getJSHints } = require('./hints');

module.exports = class PerfHintsPlugin {
    constructor({
        hintsFlag = true,
        maxBundleSize = 250
    }) {
        this.hintsFlag = hintsFlag;
        this.maxBundleSize = maxBundleSize;
    }

    apply(compiler) {
        if (!this.hintsFlag) {
            return;
        }
        const jsRegex = /\.js($|\?)/i;
        const cssRegex = /\.css$/i;

        compiler.plugin('done', (stats) => {
            const compilation = stats.compilation;

            compilation.chunks.forEach((chunk) => {
                const files = [];
                chunk.files.forEach(file => files.push(file));
                const jsFiles = files.filter(file => jsRegex.test(file));
                const cssFiles = files.filter(file => cssRegex.test(file));

                jsFiles.forEach((file) => {
                    const asset = compilation.assets[file];
                    const assetSize = asset.source().length;
                    const hints = getJSHints(jsFiles.length, assetSize, this.maxBundleSize);
                    // Patch webpack stats Obj - For Testing Purpose only
                    stats.hints = hints;
                    console.warn(chalk.yellow(hints.join('')));
                })
            });
        });
    }

}
