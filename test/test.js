const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const rimraf = require("rimraf");
const assert = require('assert');
const sinon = require('sinon');
const PerfHintsPlugin = require('../lib/index.js');
const distDir = path.join(__dirname, 'dist');
const caseDir =  path.join(__dirname, 'cases');

const runWebpack = (config, callback) => {
    const compiler = webpack(config);
    compiler.run((err, stats) => {
        if (err) {
            console.error(err);
            return;
        }
        callback(stats);
    });
};

const getConfig = (dir, options) => {
    return {
        entry: path.join(caseDir, dir, 'input.js'),
        output: {
            path: distDir,
            filename: 'bundle.js',
            libraryTarget: 'umd'
        },
        plugins: [
            new PerfHintsPlugin(options)
        ]
    }
}

const getOutput = (dir) => {
    return fs.readFileSync(path.join(caseDir, dir, 'output.js'), 'utf-8').trim();
}

const getBundle = () => fs.readFileSync(path.join(distDir, 'bundle.js'), 'utf-8');

describe('perf-hints-plugin', () => {

    beforeEach(() => {
        sinon.stub(console, 'warn');
    });

    afterEach(() => {
        rimraf.sync(distDir);
        console.warn.restore();
    });

    it('should provide hints if bundle size sizes max', (done) => {
        const config = getConfig('monolith-bundle', {
            maxBundleSize: 0.2 // specified in KB
        });
        return runWebpack(config, (stats) => {
            assert.equal(stats.hints.length, 1);
            assert(console.warn.called);
            done();
        });
    });

});
