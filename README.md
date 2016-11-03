# optimize-js-plugin

Webpack plugin that provides hints for Performance.

Attempt at providing warnings and errors while bundling JS/CSS in Webpack. Inspired from this [RFC](https://github.com/webpack/webpack/issues/3216).

## Install

```sh
npm i --save-dev perf-hints-plugin
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


### Features

+ Monolithic bundle size warnings.
+ Code splitted bundles exceed given max size.
