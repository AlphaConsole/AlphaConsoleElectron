const gulp = require('gulp');
const inno = require('gulp-inno');

gulp.src('.\ACBuild.iss').pipe(inno());

