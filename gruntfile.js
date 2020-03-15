const processorsFn = () => {
    return [
        require('cssnano')
    ];
};

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
    sass: {
      dist: {
        options: {
          style: 'expanded',
        },
        files: {
          'source/assets/styles/css/alphaconsole.css': 'source/assets/styles/scss/AlphaConsole/ac.scss',
        }
      }
    },
    postcss: {
      dist: {
        options: {
          processors: processorsFn,
        },
        src: 'source/assets/styles/css/alphaconsole.css',
        dest: 'source/assets/styles/css/alphaconsole.min.css'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('@lodder/grunt-postcss');

  //Task(s). 
  grunt.registerTask('default', ['sass', 'postcss']);

};
