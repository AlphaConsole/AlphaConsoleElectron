module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    sass: {                              // Task
      dist: {                            // Target
        options: {                       // Target options
          style: 'expanded'
        },
        files: {                         // Dictionary of files
          // 'destination': 'source'
          'source/assets/styles/css/alphaconsole.css': 'source/assets/styles/scss/AlphaConsole/compile/ac.compile.scss', 
          'source/assets/styles/css/framework.css': 'source/assets/styles/scss/AlphaConsole/compile/framework_compile.scss',      
        }
      }
    }
  });


  // Default task(s).
 
    grunt.loadNpmTasks('grunt-contrib-sass');
    
    grunt.registerTask('default', ['sass']);

};