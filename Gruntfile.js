module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    browserify: {
      client: {
        src: ['/src/js/**.js'],
        dest: 'dest/js/bundle.js'
      }
    },
    copy: {
      main: {
        files: [
          {expand: true, cwd: 'src/', src: ['**', '!js/**'], dest: 'dest/'}
        ],
      },
    },
  });

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-browserify');

  grunt.registerTask('default', ['browserify', 'copy']);
};