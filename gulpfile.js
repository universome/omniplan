var PROD = process.env.prod ? true : false;
var fs = require('fs');
var path = require('path');
var gulp = require('gulp');
var del = require('del');
var gutil = require('gulp-util');
var browserSync = require('browser-sync');
var size = require('gulp-size');
var gif = require('gulp-if');
var webpack = require('webpack');

var PATHS = {
    APP: path.join(__dirname, 'client'),
    DIST: path.join(__dirname, 'dist'),
    INDEX: path.join(__dirname, 'client/index.html'),
    SRC: [path.join(__dirname, 'client/**/*.js'), path.join(__dirname, 'client/**/*.jsx')],
    WEBPACK_CONFIG_FILE: path.join(__dirname, 'client/webpack.config.js')
    // STYLES: './client/**/*.styl',
    // SCRIPTS: './client/**/*.js',
    // IMAGES: './client/assets/images/**/*',
    // FONTS: './client/assets/fonts/**/*',
};

var webpackConfig = require(PATHS.WEBPACK_CONFIG_FILE);

// var compiler = webpack(webpackConfig);

// Images and fonts
gulp.task('assets', function() {
   gulp
       .src(PATHS.IMAGES)
       .pipe(gulp.dest(PATHS.DIST + '/images'));

   gulp
       .src(PATHS.FONTS)
       .pipe(gulp.dest(PATHS.DIST + '/fonts'));
});


gulp.task('browser-sync', function() {
    browserSync({
        files: [ PATHS.DIST + '/*'],
        server: {baseDir: PATHS.DIST},
        open: false,
        debug: true,
        port: 3000
    });
});

gulp.task('index', function() {
    gulp
        .src(PATHS.INDEX)
        .pipe(size({title: 'INDEX: '}))
        .pipe(gulp.dest(PATHS.DIST));
});


gulp.task('watch', function() {
    //gulp.watch(PATHS.SCRIPTS, ['scripts']);
    //gulp.watch(PATHS.TEMPLATES, ['scripts']);
    //gulp.watch(PATHS.STYLES, ['styles']);
    gulp.watch(PATHS.INDEX, ['index']);
    gulp.watch(PATHS.SRC, ['webpack']);

    // compiler.watch({aggregateTimeout: 0}, function(err) {
    //     console.log(err || 'Changed detected. Staff rebuilt');
    // });
});

gulp.task('webpack', function(callback) {
    webpack(webpackConfig, function(err, stats) {
        if (err) throw new gutil.PluginError('webpack', err);
        // gutil.log('[webpack]', stats.toString());
        callback();
    });
});


gulp.task('clean', function() {
    // del([PATHS.DIST + '/*']);
});

gulp.task('default', ['clean', 'index', 'watch', 'webpack', 'browser-sync'])
