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

const getConfig = (entry, hintsOptions, filename = 'bundle.js', extraPlugins = []) => {
    const plugins = [...extraPlugins, new PerfHintsPlugin(hintsOptions)]

    return {
        entry: entry,
        output: {
            path: distDir,
            filename: filename
        },
        plugins: plugins
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

    it('should provide hints for huge monolith bundle', (done) => {
        const config = getConfig(
            path.join(caseDir, 'monolith-bundle', 'input.js'),
            { maxBundleSize: 1 } // specified in KB
        );
        return runWebpack(config, (stats) => {
            assert.equal(stats.hints.length, 1);
            assert(console.warn.called);
            done();
        });
    });

    it('should provide hints for bloated code splitting', (done) => {
        const config = getConfig({
            a: path.join(caseDir, 'bloated-code-split', 'a.js'),
            b: path.join(caseDir, 'bloated-code-split', 'b.js')
        },
        { maxBundleSize: 2.5 } ,// specified in KB
        '[name].js',
        [ new webpack.optimize.CommonsChunkPlugin("common") ]
        );
        return runWebpack(config, (stats) => {
            assert.equal(stats.hints.length, 1);
            assert(console.warn.called);
            done();
        });
    });

});
