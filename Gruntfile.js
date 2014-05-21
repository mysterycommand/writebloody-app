'use strict';

var chalk = require('chalk');

function loadConfig(path) {
    var glob = require('glob');

    var config = {};
    var key;

    glob.sync('*', {cwd: path})
        .forEach(function(option) {
            key = option.replace(/\.js$/,'');
            config[key] = require(path + option);
        });

    return config;
}

module.exports = function(grunt) {

    require('load-grunt-tasks')(grunt);
    require('time-grunt')(grunt);

    grunt.initConfig(grunt.util._.extend({
        config: {
            app: 'app',
            appStatic: 'app/static',
            dist: 'dist',
            distStatic: 'dist/static',
            temp: '.tmp'
        }
    }, loadConfig('./tasks/')));

    grunt.registerTask('npm-install', function(dir) {
        /* jshint expr: true */
        dir || (dir = 'app');

        var done = this.async();

        var npm = require('npm');
        var pkg = require('./' + dir + '/package.json');
        var config = {
            'prefix': './' + dir + ''
        };

        npm.load(config, function(err) {
            if (err) { grunt.log.error(err); }

            grunt.log.writeln('\nInstalling into %s:', chalk.green(npm.dir));
            var deps = Object.keys(pkg.dependencies).map(function(key) {
                grunt.log.writeln('\t', chalk.cyan(key) + '@' + chalk.magenta(pkg.dependencies[key]));
                return key + '@' + pkg.dependencies[key];
            });
            grunt.log.writeln('');

            npm.commands.install(deps, function(err, data) {
                if (err) { grunt.log.error(err); }
                grunt.verbose.writeln('data:', data);

                done();
            });
        });
    });

    grunt.registerTask('serve', [
        'npm-install',
        'jshint',
        'clean:dev',
        'sass',
        'connect:livereload',
        'watch'
    ]);

    grunt.registerTask('build', [
        'clean:dist',
        'sass',
        'useminPrepare',
        'imagemin',
        'svgmin',
        'concat', // config generated by `useminPrepare`
        'cssmin', // config generated by `useminPrepare`
        'modernizr',
        'requirejs',
        'copy',
        'rev',
        'usemin',
        'usereplace',
        'htmlmin',
        'npm-install:dist'
    ]);

    grunt.registerTask('demo', [
        'build',
        'connect:dist:keepalive'
    ]);

    grunt.registerTask('test', [
        'clean:dev',
        'connect:test',
        'mocha'
    ]);

    grunt.registerTask('default', [
        'jshint',
        'test',
        'build'
    ]);
};
