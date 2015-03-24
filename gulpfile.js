var gulp = require('gulp'),
sass = require('gulp-sass'),
livereload = require('gulp-livereload');

gulp.task('default', function() {
    gulp.start('watch', 'sass');
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