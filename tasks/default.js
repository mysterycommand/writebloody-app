'use strict';

module.exports = function(grunt) {
    grunt.registerTask('default', [
        'lint',
        'test',
        'build'
    ]);
};
