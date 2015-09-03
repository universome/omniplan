var PROD = process.env.prod ? true : false;
console.log(PROD ? 'PRODUCTION :)' : 'DEVELOPMENT :(');

var fs = require('fs');
var path = require('path');
var gulp = require('gulp');
var del = require('del');
var rimraf = require('gulp-rimraf');
var babel = require('gulp-babel');
var browserSync = require('browser-sync');
var stylus = require('gulp-stylus');
var size = require('gulp-size');
var gif = require('gulp-if');
var minifyCSS = require('gulp-minify-css');
var bower = require('main-bower-files');
var webpack = require('webpack');

var PATHS = {
    APP: path.join(__dirname, 'client'),
    DIST: path.join(__dirname, 'dist'),
    INDEX: path.join(__dirname, 'client/index.html'),
    WEBPACK_CONFIG_FILE: path.join(__dirname, 'client/webpack.config.js')
    // STYLES: './client/**/*.styl',
    // SCRIPTS: './client/**/*.js',
    // IMAGES: './client/assets/images/**/*',
    // FONTS: './client/assets/fonts/**/*',
};

var config = require(PATHS.WEBPACK_CONFIG_FILE);
var compiler = webpack(config);

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
    var config = {
        files: [ PATHS.DIST + '/*'],
        server: {
            baseDir: PATHS.DIST,
            middleware: function(req, res, next) {
                var fileName = PATHS.DIST + req.url;
                var isFileExists = fs.existsSync(fileName);

                if (!isFileExists && fileName.indexOf('browser-sync-client') < 0) {
                    req.url = '/index.html';
                }

                return next();
            }
        },

        open: false,
        debug: true,
        port: 3000
    }

    browserSync(config);
});

gulp.task('index', function() {
    gulp
        .src(PATHS.INDEX)
        .pipe(size({title: 'INDEX: '}))
        .pipe(gulp.dest(PATHS.DIST));
});


gulp.task('watch', ['browser-sync'], function() {
    //gulp.watch(PATHS.SCRIPTS, ['scripts']);
    //gulp.watch(PATHS.TEMPLATES, ['scripts']);
    //gulp.watch(PATHS.STYLES, ['styles']);
    gulp.watch(PATHS.INDEX, ['index']);

    compiler.watch({aggregateTimeout: 0}, function(err) {
        console.log(err || 'Changed detected. Staff rebuilt');
    });
});


gulp.task('clean', function() {
    del([PATHS.DIST + '/*']);
});

gulp.task('default', ['index', 'watch'])
