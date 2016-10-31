'use strict';

// Ported from Webpack - https://github.com/webpack/webpack/blob/master/lib/Stats.js#L432
const formatSize = function(size) {
    if(size <= 0) return "0 bytes";

    const abbreviations = ["bytes", "kB", "MB", "GB"];
    const index = Math.floor(Math.log(size) / Math.log(1000));

    return +(size / Math.pow(1000, index))
        .toPrecision(3) + " " + abbreviations[index];
};

const isHugeBundle = (bundle, maxBundleSize) => {
    const sizeInKB = (bundle/1024).toPrecision(2);
    if (sizeInKB >= maxBundleSize) {
        return true;
    }
    return false;
}

module.exports.getJSHints = (noOfFiles, bundleSize, maxBundleSize) => {
    let jsHints = [];
    if (noOfFiles === 1 && isHugeBundle(bundleSize, maxBundleSize)) {
        jsHints.push(`
            Tip: Instead of a single monolith bundle of size ${formatSize(bundleSize)}, use code-splitting in webpack to lazyload the modules. Learn more - https://webpack.github.io/docs/code-splitting.html
        `);
    }

    return jsHints;
};

module.exports.getCSSHints = {

};
