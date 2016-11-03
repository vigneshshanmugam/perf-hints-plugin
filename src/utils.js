'use strict';

module.exports.formatSize = function(size) {
    if(size <= 0) return "0 bytes";

    const abbreviations = ["bytes", "kB", "MB", "GB"];
    const index = Math.floor(Math.log(size) / Math.log(1000));

    return +(size / Math.pow(1000, index))
        .toPrecision(3) + " " + abbreviations[index];
};

module.exports.isHugeBundle = (bundle, maxBundleSize) => {
    const sizeInKB = (bundle/1024).toPrecision(2);
    if (sizeInKB >= maxBundleSize) {
        return true;
    }
    return false;
}

module.exports.unpad = (str) => {
    const lines = str.split('\n');
    const m = lines[1] && lines[1].match(/^\s+/);
    if (!m) {
        return str;
    }
    const spaces = m[0].length;
    return lines.map(
        line => line.slice(spaces)
    ).join('\n').trim();
};
