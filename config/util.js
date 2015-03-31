'use strict'

exports.getDeployTasks = function(grunt, type) {
    var requirejsConfig = grunt.file.readJSON('config/requirejs-config.json'),
        COMMON_TASKS = {
            dev: [],
            test: ['copy:testJS', 'cssmin', 'copy:cssImages', 'copy:spriteImages'],
            production: ['diff', 'cssmin', 'copy:cssImages', 'copy:spriteImages']
        },
        requireJsTasks = [],
        suffix = '-' + type,
        mainMods = requirejsConfig.mainModule,
        i;

    for (i in mainMods) {
        if (mainMods[i].indexOf('!') === 0) {
            continue;
        }
        requireJsTasks.push('requirejs:' + mainMods[i] + suffix);
    }

    return requireJsTasks.concat(COMMON_TASKS[type]);
};

/**
 * 获取合并require.js模块的grunt目标
 */
exports.getRequireJsTargets = function(grunt) {
    var requirejsConfig = grunt.file.readJSON('config/requirejs-config.json'),
        deployConfig = grunt.file.readJSON('config/deploy-config.json'),
        mainMods = requirejsConfig.mainModule,
        targets = {};

    targets.options = {
        baseUrl: deployConfig.scriptsDir,
        mainConfigFile: deployConfig.scriptsDir + 'require-config.js',
        paths: requirejsConfig.modulePaths,
        preserveLicenseComments: false
    };

    ['-dev', '-test', '-production'].forEach(function(type) {
        var i;

        for (i in mainMods) {
            targets[mainMods[i] + type] = {
                options: {
                    name: mainMods[i],
                    // optimize: type === '-dev' ? 'none' : 'uglify2',
                    optimize: 'none',
                    out: deployConfig.mainScriptsDir + 
                        deployConfig.concatDir + mainMods[i] + '.js'
                }
            };
        }
    });
    return targets;
};

exports.getSpriteOption = function(grunt, type, noImgPath) {
    var ASSETS_DIR = 'assets/';
    return {
        cssOpts: {
            cssClass: function(item) {
                return cssClassFilter(grunt, '.' + type + '-', item);
            }
        },
        algorithm: 'binary-tree',
        padding: 2,
        imgPath: (noImgPath ? '' : 'sprites/') + type + '_sprite.png',
        src: ASSETS_DIR + 'css/images/' + type + '/*.png',
        destImg: ASSETS_DIR + 'css/sprites/' + type + '_sprite.png',
        destCSS: ASSETS_DIR + 'css/sprites/' + type + '_sprite.css'
    };
};

/**
 * 自动合成CSS雪碧图的CSS类过滤器
 * @param  {String} prefix 类名前缀
 * @param  {String} item   原始CSS类名
 * @return {String}        最终的CSS类名
 */
function cssClassFilter(grunt, prefix, item) {
    var cssSpritesConfig = grunt.file.readJSON('config/css-sprites-config.json');

    if (item.name.indexOf('-hover') >= 0) {
        var originalName = item.name.replace('-hover', ''),
            cssName = prefix + originalName + ':hover,' + prefix + originalName + '.active';
        if (cssSpritesConfig.hover.hasOwnProperty(item.name)) {
            var parentName = cssSpritesConfig.hover[item.name];
            cssName = cssName + ', .' + parentName + ':hover ' + prefix + originalName;
            cssName = cssName + ', .' + parentName + '.active ' + prefix + originalName;
        }
        return cssName;
    } else if (cssSpritesConfig.active.hasOwnProperty(item.name) &&
        item.name.indexOf('-active') >= 0) {
        return prefix + item.name.replace('-active', '.active');
    } else {
        return prefix + item.name;
    }
};

exports.cssClassFilter = cssClassFilter;

exports.getLessFiles = function(grunt) {
    var c = grunt.file.readJSON('config/less-config.json');
    return c;
};
