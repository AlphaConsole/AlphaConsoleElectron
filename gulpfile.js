var gulp = require('gulp');
var inno = require('gulp-inno');

gulp.src('.\ACBuild.iss').pipe(inno());

