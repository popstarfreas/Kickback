module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        ts: {
            default: {
                src: ["*.ts", "spec/**/*.ts"],
                outDir: 'build'
            }
        },
        jasmine_node: {
            options: {
            forceExit: true,
            match: '.',
            matchall: false,
            extensions: 'js',
            specNameMatcher: 'spec'
            },
            all: []
        }
    });

    // Tasks
    grunt.loadNpmTasks('grunt-jasmine-node');
    grunt.loadNpmTasks("grunt-ts");

    // Default task(s).
    grunt.registerTask('default', ['ts', 'jasmine_node']);
};