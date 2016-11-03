'use strict';

const Stats = require('webpack/lib/Stats');
const { formatSize, isHugeBundle } = require('./utils');
const { getJSHints } = require('./hints');

// Overiding this property for custom stats - Not really proud of this code though!
// Copied from webpack stats - https://github.com/webpack/webpack/blob/master/lib/Stats.js
Stats.jsonToString = (obj, useColors, maxBundleSize) => {
    var buf = [];

    var defaultColors = {
        bold: "\u001b[1m",
        yellow: "\u001b[1m\u001b[33m",
        red: "\u001b[1m\u001b[31m",
        green: "\u001b[1m\u001b[32m",
        cyan: "\u001b[1m\u001b[36m",
        magenta: "\u001b[1m\u001b[35m"
    };

    var colors = Object.keys(defaultColors).reduce(function(obj, color) {
        obj[color] = function(str) {
            if(useColors) {
                buf.push(
                    (useColors === true || useColors[color] === undefined) ?
                    defaultColors[color] : useColors[color]
                );
            }
            buf.push(str);
            if(useColors) {
                buf.push("\u001b[39m\u001b[22m");
            }
        };
        return obj;
    }, {
        normal: function(str) {
            buf.push(str);
        }
    });

    function coloredTime(time) {
        var times = [800, 400, 200, 100];
        if(obj.time) {
            times = [obj.time / 2, obj.time / 4, obj.time / 8, obj.time / 16];
        }
        if(time < times[3])
            colors.normal(time + "ms");
        else if(time < times[2])
            colors.bold(time + "ms");
        else if(time < times[1])
            colors.green(time + "ms");
        else if(time < times[0])
            colors.yellow(time + "ms");
        else
            colors.red(time + "ms");
    }

    function newline() {
        buf.push("\n");
    }

    function getFormatAndValue(arr, row, col, defColor) {
        var value = arr[row][col], format = defColor;
        if (typeof value === "object") {
            if (value.truthy) {
                format = colors.yellow;
            }
            value = value.holder;
        } else if (row === 0) {
            format = colors.bold;
        }
        return {format, value};
    }

    function table(array, formats, align, splitter) {
        var row;
        var rows = array.length;
        var col;
        var cols = array[0].length;
        var colSizes = new Array(cols);
        var value;
        for(col = 0; col < cols; col++)
            colSizes[col] = 3;
        for(row = 0; row < rows; row++) {
            for(col = 0; col < cols; col++) {
                value = array[row][col] + "";
                if(value.length > colSizes[col]) {
                    colSizes[col] = value.length;
                }
            }
        }

        for(row = 0; row < rows; row++) {
            for(col = 0; col < cols; col++) {
                let { format, value } = getFormatAndValue(array, row, col, formats[col]);
                var l = value.length;
                if(align[col] === "l")
                    format(value);
                for(; l < colSizes[col] && col !== cols - 1; l++)
                    colors.normal(" ");
                if(align[col] === "r")
                    format(value);
                if(col + 1 < cols)
                    colors.normal(splitter || "  ");
            }
            newline();
        }
    }

    if(obj.hash) {
        colors.normal("Hash: ");
        colors.bold(obj.hash);
        newline();
    }
    if(obj.version) {
        colors.normal("Version: webpack ");
        colors.bold(obj.version);
        newline();
    }
    if(typeof obj.time === "number") {
        colors.normal("Time: ");
        colors.bold(obj.time);
        colors.normal("ms");
        newline();
    }
    if(obj.publicPath) {
        colors.normal("PublicPath: ");
        colors.bold(obj.publicPath);
        newline();
    }
    if(obj.assets && obj.assets.length > 0) {
        var t = [
            ["Asset", "Size", "Chunks", "", "Chunk Names"]
        ];
        obj.assets.forEach(function(asset) {
            var check = isHugeBundle(asset.size, maxBundleSize);
            var isJsAsset = (/\.js($|\?)/i).test(asset.name);
            t.push([
                {
                    holder: asset.name,
                    truthy: isJsAsset && check
                },
                {
                    holder: formatSize(asset.size),
                    truthy: isJsAsset && check
                },
                asset.chunks.join(", "),
                asset.emitted ? "[emitted]" : "",
                asset.chunkNames.join(", ")
            ]);
        });
        table(t, [ colors.green, colors.normal, colors.bold, colors.green, colors.normal], "rrrll");
    }
    if(obj.entrypoints) {
        Object.keys(obj.entrypoints).forEach(function(name) {
            colors.normal("Entrypoint ");
            colors.bold(name);
            colors.normal(" =");
            obj.entrypoints[name].assets.forEach(function(asset) {
                colors.normal(" ");
                colors.green(asset);
            });
            newline();
        });
    }
    var modulesByIdentifier = {};
    if(obj.modules) {
        obj.modules.forEach(function(module) {
            modulesByIdentifier["$" + module.identifier] = module;
        });
    } else if(obj.chunks) {
        obj.chunks.forEach(function(chunk) {
            if(chunk.modules) {
                chunk.modules.forEach(function(module) {
                    modulesByIdentifier["$" + module.identifier] = module;
                });
            }
        });
    }

    function processModuleAttributes(module) {
        colors.normal(" ");
        colors.normal(formatSize(module.size));
        if(module.chunks) {
            module.chunks.forEach(function(chunk) {
                colors.normal(" {");
                colors.yellow(chunk);
                colors.normal("}");
            });
        }
        if(!module.cacheable) {
            colors.red(" [not cacheable]");
        }
        if(module.optional) {
            colors.yellow(" [optional]");
        }
        if(module.built) {
            colors.green(" [built]");
        }
        if(module.prefetched) {
            colors.magenta(" [prefetched]");
        }
        if(module.failed)
            colors.red(" [failed]");
        if(module.warnings)
            colors.yellow(" [" + module.warnings + " warning" + (module.warnings === 1 ? "" : "s") + "]");
        if(module.errors)
            colors.red(" [" + module.errors + " error" + (module.errors === 1 ? "" : "s") + "]");
    }

    function processModuleContent(module, prefix) {
        if(Array.isArray(module.providedExports)) {
            colors.normal(prefix);
            colors.cyan("[exports: " + module.providedExports.join(", ") + "]");
            newline();
        }
        if(module.usedExports !== undefined) {
            if(module.usedExports !== true) {
                colors.normal(prefix);
                if(module.usedExports === false)
                    colors.cyan("[no exports used]");
                else
                    colors.cyan("[only some exports used: " + module.usedExports.join(", ") + "]");
                newline();
            }
        }
        if(module.reasons) {
            module.reasons.forEach(function(reason) {
                colors.normal(prefix);
                colors.normal(reason.type);
                colors.normal(" ");
                colors.cyan(reason.userRequest);
                if(reason.templateModules) colors.cyan(reason.templateModules.join(" "));
                colors.normal(" [");
                colors.normal(reason.moduleId);
                colors.normal("] ");
                colors.magenta(reason.module);
                if(reason.loc) {
                    colors.normal(" ");
                    colors.normal(reason.loc);
                }
                newline();
            });
        }
        if(module.profile) {
            colors.normal(prefix);
            var sum = 0;
            var path = [];
            var current = module;
            while(current.issuer) {
                path.unshift(current = current.issuer);
            }
            path.forEach(function(module) {
                colors.normal("[");
                colors.normal(module.id);
                colors.normal("] ");
                if(module.profile) {
                    var time = (module.profile.factory || 0) + (module.profile.building || 0);
                    coloredTime(time);
                    sum += time;
                    colors.normal(" ");
                }
                colors.normal("->");
            });
            Object.keys(module.profile).forEach(function(key) {
                colors.normal(" " + key + ":");
                var time = module.profile[key];
                coloredTime(time);
                sum += time;
            });
            colors.normal(" = ");
            coloredTime(sum);
            newline();
        }
    }

    if(obj.chunks) {
        obj.chunks.forEach(function(chunk) {
            colors.normal("chunk ");
            if(chunk.id < 1000) colors.normal(" ");
            if(chunk.id < 100) colors.normal(" ");
            if(chunk.id < 10) colors.normal(" ");
            colors.normal("{");
            colors.yellow(chunk.id);
            colors.normal("} ");
            colors.green(chunk.files.join(", "));
            if(chunk.names && chunk.names.length > 0) {
                colors.normal(" (");
                colors.normal(chunk.names.join(", "));
                colors.normal(")");
            }
            colors.normal(" ");
            colors.normal(formatSize(chunk.size));
            chunk.parents.forEach(function(id) {
                colors.normal(" {");
                colors.yellow(id);
                colors.normal("}");
            });
            if(chunk.entry) {
                colors.yellow(" [entry]");
            } else if(chunk.initial) {
                colors.yellow(" [initial]");
            }
            if(chunk.rendered) {
                colors.green(" [rendered]");
            }
            if(chunk.recorded) {
                colors.green(" [recorded]");
            }
            newline();
            if(chunk.origins) {
                chunk.origins.forEach(function(origin) {
                    colors.normal("    > ");
                    if(origin.reasons && origin.reasons.length) {
                        colors.yellow(origin.reasons.join(" "));
                        colors.normal(" ");
                    }
                    if(origin.name) {
                        colors.normal(origin.name);
                        colors.normal(" ");
                    }
                    if(origin.module) {
                        colors.normal("[");
                        colors.normal(origin.moduleId);
                        colors.normal("] ");
                        var module = modulesByIdentifier["$" + origin.module];
                        if(module) {
                            colors.bold(module.name);
                            colors.normal(" ");
                        }
                        if(origin.loc) {
                            colors.normal(origin.loc);
                        }
                    }
                    newline();
                });
            }
            if(chunk.modules) {
                chunk.modules.forEach(function(module) {
                    colors.normal(" ");
                    if(module.id < 1000) colors.normal(" ");
                    if(module.id < 100) colors.normal(" ");
                    if(module.id < 10) colors.normal(" ");
                    colors.normal("[");
                    colors.normal(module.id);
                    colors.normal("] ");
                    colors.bold(module.name);
                    processModuleAttributes(module);
                    newline();
                    processModuleContent(module, "        ");
                });
                if(chunk.filteredModules > 0) {
                    colors.normal("     + " + chunk.filteredModules + " hidden modules");
                    newline();
                }
            }
        });
    }
    if(obj.modules) {
        obj.modules.forEach(function(module) {
            if(module.id < 1000) colors.normal(" ");
            if(module.id < 100) colors.normal(" ");
            if(module.id < 10) colors.normal(" ");
            colors.normal("[");
            colors.normal(module.id);
            colors.normal("] ");
            colors.bold(module.name || module.identifier);
            processModuleAttributes(module);
            newline();
            processModuleContent(module, "       ");
        });
        if(obj.filteredModules > 0) {
            colors.normal("    + " + obj.filteredModules + " hidden modules");
            newline();
        }
    }
    if(obj._showWarnings && obj.warnings) {
        obj.warnings.forEach(function(warning) {
            newline();
            colors.yellow("WARNING in " + warning);
            newline();
        });
    }
    if(obj._showErrors && obj.errors) {
        obj.errors.forEach(function(error) {
            newline();
            colors.red("ERROR in " + error);
            newline();
        });
    }
    if(obj.children) {
        obj.children.forEach(function(child) {
            if(child.name) {
                colors.normal("Child ");
                colors.bold(child.name);
                colors.normal(":");
            } else {
                colors.normal("Child");
            }
            newline();
            buf.push("    ");
            buf.push(Stats.jsonToString(child, useColors).replace(/\n/g, "\n    "));
            newline();
        });
    }
    if(obj.needAdditionalPass) {
        colors.yellow("Compilation needs an additional pass and will compile again.");
    }

    while(buf[buf.length - 1] === "\n") buf.pop();
    return buf.join("");
}

class CustomStats extends Stats {

    constructor (compilation, maxBundleSize = 250) {
        super(compilation);
        this.maxBundleSize = maxBundleSize;
    }

    toString(options) {
        if(typeof options === "boolean" || typeof options === "string") {
            options = Stats.presetToOptions(options);
        } else if(!options) options = {};

        function d(v, def) {
            return v === undefined ? def : v;
        }
        var useColors = d(options.colors, false);

        var obj = this.toJson(options, true);

        return Stats.jsonToString(obj, useColors, this.maxBundleSize);
    }

}

module.exports = CustomStats;
