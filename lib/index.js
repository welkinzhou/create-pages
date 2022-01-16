const { src, dest, parallel, series, watch } = require('gulp')
const del = require('del')
const gulpLoadPlugins = require('gulp-load-plugins');
const plugins = gulpLoadPlugins()
const sass = require('gulp-sass')(require('sass'));
const browserSync = require('browser-sync')
const bs = browserSync.create()
// 获取当前目录
const cwd = process.cwd()
// 获取配置项，可以设置默认项
let confg = {
    build: {
        src: 'src',
        dist: 'dist',
        temp: 'temp',
        public: 'public',
        paths: {
            styles: 'assets/styles/*.scss',
            scripts: 'assets/scripts/*.js',
            pages: '*.html',
            images: 'assets/images/**',
            fonts: 'assets/fonts/**'
        }
    }
}
// 尝试获取配置文件
try {
    const loadConfg = require(`${cwd}/creat.confg.js`)
    // 合并配置项
    confg = Object.assign({}, confg, loadConfg)
} catch (error) {
}


const renderData = confg.data

const clear = () => {
    return del([confg.build.dist, confg.build.temp])
}

const style = () => {
    // 使用 cwd，指定查找目录
    return src(confg.build.paths.styles, { base: confg.build.src, cwd: confg.build.src })
        .pipe(sass())
        .pipe(dest(confg.build.temp))
}

const script = () => {
    return src(confg.build.paths.scripts, { base: confg.build.src, cwd: confg.build.src })
        .pipe(plugins.babel({ presets: [require('@babel/preset-env')] }))
        .pipe(dest(confg.build.temp))
}

const page = () => {
    return src(confg.build.paths.pages, { base: confg.build.src, cwd: confg.build.src })
        .pipe(plugins.swig({ data: renderData, defaults: { cache: false } }))
        .pipe(dest(confg.build.temp))
}

const image = () => {
    return src(confg.build.paths.images, { base: confg.build.src, cwd: confg.build.src })
        .pipe(plugins.imagemin())
        .pipe(dest(confg.build.dist))
}
const font = () => {
    return src(confg.build.paths.fonts, { base: confg.build.src, cwd: confg.build.src })
        .pipe(plugins.imagemin())
        .pipe(dest(confg.build.dist))
}

const extra = () => {
    return src('**', { base: confg.build.public, cwd: confg.build.public })
        .pipe(dest(confg.build.dist))
}

const serve = () => {
    watch(confg.build.paths.styles, { cwd: confg.build.src }, style)
    watch(confg.build.paths.scripts, { cwd: confg.build.src }, script)
    watch(confg.build.pages, { cwd: confg.build.src }, page)
    watch([
        confg.build.images,
        confg.build.fonts
    ], { cwd: confg.build.src }, bs.reload)
    watch('**', { cwd: confg.build.public }, bs.reload)

    bs.init({
        notify: false,
        port: 8081,
        open: false,
        server: {
            baseDir: [confg.build.temp, confg.build.src, confg.build.public],
            routes: {
                '/node_modules': 'node_modules'
            }
        }
    })
}

const useref = () => {
    return src('*.html',  { base: confg.build.temp, cwd: confg.build.temp })
        .pipe(plugins.useref({ searchPath: [confg.build.temp, '.'] }))
        .pipe(plugins.if(/\.js$/, plugins.uglify()))
        .pipe(plugins.if(/\.css$/, plugins.cleanCss()))
        .pipe(plugins.if(/\.html$/, plugins.htmlmin({
            collapseWhitespace: true,
            minifyCSS: true,
            minifyJS: true
        })))
        .pipe(dest(confg.build.dist))
}

// 编译命令
const compile = parallel(style, script, page)
// 打包命令
const build = series(clear, parallel(series(compile, useref), image, font, extra))
// 开发使用的命令
const develop = series(compile, serve)

module.exports = {
    develop,
    build,
    clear
}