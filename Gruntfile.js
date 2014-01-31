module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-mocha-cli');
    grunt.loadNpmTasks('grunt-nodemon');

    grunt.initConfig({
        mochacli: {
            options: {
                reporter: 'spec',
                require: ['should']
            },
            all: ['tests/']
        },
        nodemon: {
            dev: {
                options: {
                    file: 'index.js',
                    watchedExtensions: ['js', 'json'],
                    watchedFolders: ['src']
                }
            }
        }
    });

    grunt.registerTask('test', ['mochacli:all']);
    grunt.registerTask('node', ['nodemon:dev']);
};
