module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-mocha-cli');
    grunt.loadNpmTasks('grunt-nodemon');

    grunt.initConfig({
        mochacli: {
            options: {
                reporter: 'spec',
                require: ['should']
            },
            unit: ['tests/unit'],
            func: ['tests/functionnal']
        },
        nodemon: {
            dev: {
                options: {
                    file: 'index.js',
                    watchedExtensions: ['js'],
                    watchedFolders: ['src']
                }
            }
        }
    });

    grunt.registerTask('test', ['mochacli:unit', 'mochacli:func']);
    grunt.registerTask('node', ['nodemon:dev']);
};
