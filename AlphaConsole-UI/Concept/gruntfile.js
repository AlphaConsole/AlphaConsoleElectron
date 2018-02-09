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
            'assets/css/styles.css': 'assets/css/styles.scss',       
          }
        }
      }
    });
  

    // Default task(s).
   
      grunt.loadNpmTasks('grunt-contrib-sass');
      
      grunt.registerTask('default', ['sass']);
  
  };