var gulp = require('gulp'),
sass = require('gulp-sass'),
livereload = require('gulp-livereload'),
postcss      = require('gulp-postcss'),
sourcemaps   = require('gulp-sourcemaps'),
autoprefixer = require('autoprefixer-core');


gulp.task('autoprefixer', function () { 
    return gulp.src('public/css/*.css')
        .pipe(sourcemaps.init())
        .pipe(postcss([ autoprefixer({ browsers: ['last 2 version'] }) ]))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('public/css'));
});

gulp.task('default', function() {
    gulp.start('watch', 'sass', 'autoprefixer');
});

gulp.task('sass', function () {
    gulp.src('public/scss/*.scss')
        .pipe(sass())
        .pipe(gulp.dest('public/css/'));
});

gulp.task('watch',function(){
    gulp.watch('public/scss/*.scss', ['sass']);
    livereload.listen();
});