module.exports = (grunt) => {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    watch: {
      css: {
        files: '**/*.scss',
        tasks: ['sass'],
        options: {
          livereload: true,
        },
      },
    },
    sass: { // Task
      dist: { // Target
        options: { // Target options
          style: 'expanded'
        },
        files: { // Dictionary of files
          // 'destination': 'source'
          'source/assets/styles/css/alphaconsole.css': 'source/assets/styles/scss/AlphaConsole/compile/ac.compile.scss',
          'source/assets/styles/css/framework.css': 'source/assets/styles/scss/AlphaConsole/compile/framework_compile.scss',
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');

  //Task(s). 
  grunt.registerTask('default', ['sass']);

};