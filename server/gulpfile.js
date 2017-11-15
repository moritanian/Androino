'use strict';

const socket = require("socket.io");

const gulp = require('gulp');
//const uglify = require('gulp-uglify');
const gutil = require('gulp-util');
const browserify = require('browserify');
const del = require('del');
const source = require("vinyl-source-stream");
const buffer = require("vinyl-buffer");
const concat = require('gulp-concat');
//const babelify = require('babelify');
//const babel = require('gulp-babel');

const babili = require("gulp-babili");


/// Build the scripts


gulp.task('ws', function(){
    
});

gulp.task('browserify', function(callback) {
    gulp.src(['./scripts/calibration/*.js',
             './scripts/components/*.js',
             './scripts/core/*.js',
             './scripts/slam/*.js'
             ])
        .pipe(concat('androino.js'))
        //.pipe(babel())
        .pipe(gulp.dest('./build'))
        .on('end', callback);
});

gulp.task('clean', function(){
    return del(['build/']);
});

/// Minify the build script, after building it
gulp.task('minify', ['browserify'], function() {
    return gulp.src("./build/androino.js")
        .pipe(babili({
            mangle: {
                keepClassName: true
            }
        }).on('error', gutil.log))
        .pipe(concat('androino.min.js'))
         //.pipe(source('androino.min.js'))
        .pipe(gulp.dest('./build/'));
});

gulp.task('build', ['clean', 'minify']);

/// Auto rebuild and host
gulp.task('default',['server']);

gulp.task('ws',['ws']);

