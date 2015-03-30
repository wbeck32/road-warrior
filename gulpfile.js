var gulp = require('gulp'),
sass = require('gulp-sass'),
minifycss = require('gulp-minify-css'),
uglify = require('gulp-uglify'),
livereload = require('gulp-livereload'),
postcss      = require('gulp-postcss'),
sourcemaps   = require('gulp-sourcemaps'),
concat = require('gulp-concat'),
jshint = require('gulp-jshint'),
nodemon = require('gulp-nodemon'),
autoprefixer = require('autoprefixer-core');


gulp.task('default', function() {
    gulp.start('buildJs', 'sass', 'watch', 'start');
});


gulp.task('sass', function () {
    return gulp.src('build/scss/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(postcss([ autoprefixer({ browsers: ['last 2 version'] }) ]))
        .pipe(concat('styles.css'))
        .pipe(sourcemaps.write('.'))
        .pipe(minifycss())
        .pipe(gulp.dest('public/css'));
});


gulp.task('buildJs', function(){
    return gulp.src('build/js/app/*.js')
        .pipe(sourcemaps.init())
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('default'))
        .pipe(concat('main.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('public/js'));
});

gulp.task('start', function () {
  nodemon({
    script: 'app.js',
    env: { 'NODE_ENV': 'development' }
  })
})


gulp.task('watch',function(){
    gulp.watch('build/scss/*.scss', ['sass']);
    gulp.watch('build/js/app/*.js', ['buildJs']);
    livereload.listen();
});
