module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    browserify: {
      client: {
        src: ['src/js/logic.js'],
        dest: 'dest/js/bundle.js',
      }
    },
    copy: {
      main: {
        files: [
          {expand: true, cwd: 'src/', src: ['**', '!js/**'], dest: 'dest/'}
        ],
      },
    },
    zip: {
      'using-cwd': {
        cwd: 'dest/',
        src: ['dest/**'],
        dest: 'dest/zip/dest.zip'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-zip');

  grunt.registerTask('default', ['browserify', 'copy', 'zip']);
};
