'use strict';

var gulp = require('gulp'),
    watch = require('gulp-watch'),
    prefixer = require('gulp-autoprefixer'),
    uglify = require('gulp-uglify'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    rigger = require('gulp-rigger'),
    cssmin = require('gulp-minify-css'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    rimraf = require('rimraf'),
    browserSync = require("browser-sync"),
    pug = require('gulp-pug'),
    reload = browserSync.reload;

var config = {
    server: {
        baseDir: "./build"
    },
    tunnel: true,
    host: 'localhost',
    port: 9000,
    logPrefix: "Frontend_Devil"
};

var path = {
    build: { //Тут мы укажем куда складывать готовые после сборки файлы
        //html: 'build/',
        js: 'build/js/',
        css: 'build/css/',
        img: 'build/img/',
        fonts: 'build/fonts/',
        pug: 'build/'
    },
    src: { //Пути откуда брать исходники
        //html: 'source/*.html', //Синтаксис src/*.html говорит gulp что мы хотим взять все файлы с расширением .html
        js: 'source/js/*.js',//В стилях и скриптах нам понадобятся только main файлы
        style: 'source/scss/**/*.scss',
        img: 'source/img/**/*.*', //Синтаксис img/**/*.* означает - взять все файлы всех расширений из папки и из вложенных каталогов
        fonts: 'source/fonts/**/*.*',
        pug: 'source/pug/**/*.pug'
    },
    watch: { //Тут мы укажем, за изменением каких файлов мы хотим наблюдать
        //html: 'source/**/*.html',
        js: 'source/js/**/*.js',
        style: 'source/scss/**/*.scss',
        img: 'source/img/**/*.*',
        fonts: 'source/fonts/**/*.*',
        pug: 'source/pug/**/*.pug'
    },
    clean: './build'
};
//Сборка HTML из PUG
gulp.task('pug:build', function buildHTML() {
  gulp.src(path.src.pug)
  .pipe(pug({
    pretty: true
  }))
  .pipe(gulp.dest(path.build.pug))
});
//Минимизация изображений
gulp.task('image:build', function () {
    gulp.src(path.src.img) //Выберем наши картинки
        .pipe(imagemin({ //Сожмем их
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(gulp.dest(path.build.img)) //И бросим в build
        .pipe(reload({stream: true}));
});
//Сборка CSS
gulp.task('style:build', function () {
    gulp.src(path.src.style) //Выберем наш main.scss
        .pipe(sourcemaps.init()) //То же самое что и с js
        .pipe(sass()) //Скомпилируем
        .pipe(prefixer()) //Добавим вендорные префиксы
        //.pipe(cssmin()) //Сожмем
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.css)) //И в build
        .pipe(reload({stream: true}));
});
//JavaScript

gulp.task('js:build', function () {
    gulp.src(path.src.js) //Найдем наш main файл
        .pipe(rigger()) //Прогоним через rigger
        .pipe(sourcemaps.init()) //Инициализируем sourcemap
        .pipe(uglify()) //Сожмем наш js
        .pipe(sourcemaps.write()) //Пропишем карты
        .pipe(gulp.dest(path.build.js)) //Выплюнем готовый файл в build
        .pipe(reload({stream: true})); //И перезагрузим сервер
});

//Шрифты
gulp.task('fonts:build', function() {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts))
});
//Лайфрелоад
gulp.task('webserver', function () {
    browserSync(config);
});
//Очистка
gulp.task('clean', function (cb) {
    rimraf(path.clean, cb);
});
gulp.task('build', [
    //'clean',
    //'html:build',
    'pug:build',
    'js:build',
    'style:build',
    'fonts:build',
    'image:build'
]);
//Вотч

gulp.task('watch', function(){
    /*
    watch([path.watch.html], function(event, cb) {
        gulp.start('html:build');
    });
    */
    
    watch([path.watch.pug], function(event, cb) {
        gulp.start('pug:build');
    });
    watch([path.watch.style], function(event, cb) {
        gulp.start('style:build');
    });
    
    watch([path.watch.js], function(event, cb) {
        gulp.start('js:build');
    });
    
    watch([path.watch.img], function(event, cb) {
        gulp.start('image:build');
    });
    watch([path.watch.fonts], function(event, cb) {
        gulp.start('fonts:build');
    });
    
});
/*
gulp.task('watch', function () {
  gulp.watch('source/**//*', ['build']);
});
*/
gulp.task('default', ['build', 'webserver', 'watch']);