# optimize-js-plugin

Webpack plugin that provides hints for Performance.

Inspired from this [RFC](https://github.com/webpack/webpack/issues/3216).

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
    new OptimizeJsPlugin({
        hints: true,
        maxBundleSize: 200 // kB
    })
  ]
}
```

### Options

+ `hints` - Flag to Enable/Disable hints in the console
+ `maxBundleSize` - for setting the performance budget. Expressed in kiloBytes.


### Features

+ Outputs Monolithic bundle size warnings.