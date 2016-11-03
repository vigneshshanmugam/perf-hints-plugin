'use strict';

const { formatSize, isHugeBundle, unpad } = require('./utils');

module.exports.getJSHints = (noOfAssets, bundleSize, maxBundleSize) => {
    let jsHints = [];
    if (noOfAssets === 1 && isHugeBundle(bundleSize, maxBundleSize)) {
        jsHints.push(unpad(`
            Perf Hints Plugin: Instead of a single monolith bundle of size ${formatSize(bundleSize)}, use code-splitting in webpack to lazyload the modules. Learn more - https://webpack.github.io/docs/code-splitting.html
        `));
    } else if (isHugeBundle(bundleSize, maxBundleSize)) {
        jsHints.push(unpad(`
            Perf Hints Plugin: Highlighted chunks are large and are likely to impact web performance. Consider keeping total chunks of page < ${maxBundleSize} kB
        `));
    }
    return jsHints;
};

module.exports.getCSSHints = {

};
