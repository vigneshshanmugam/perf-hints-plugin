# perf-hints-plugin

This Plugin will be deprecated once this PR is merged https://github.com/webpack/webpack/pull/3350

Webpack plugin that provides hints for Performance.

Attempt at providing warnings and errors while bundling JS/CSS in Webpack. Inspired from this [RFC](https://github.com/webpack/webpack/issues/3216).

### Features

+ Monolithic bundle size warnings.
![monolith](https://github.com/vigneshshanmugam/perf-hints-plugin/blob/master/images/monolith.png)

+ Code splitted bundles exceed given max size.
![code-split](https://github.com/vigneshshanmugam/perf-hints-plugin/blob/master/images/code-split.png)

## Install

```sh
npm i --save-dev perf-hints-plugin
```

```sh
yarn add -D perf-hints-plugin
```

## Usage

```js
// webpack.config.js
const PerfHintsPlugin = require("perf-hints-plugin");
module.exports = {
  entry: //...,
  output: //...,
  plugins: [
    new PerfHintsPlugin({
        hints: true,
        maxBundleSize: 200 // kB
    })
  ]
}
```

### Options

+ `hints` - Flag to Enable/Disable hints in the console. Default is `false`
+ `maxBundleSize` - for setting the performance budget. Expressed in kiloBytes. Default value is `250kB`
