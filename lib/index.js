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
let confg = {}
// 尝试获取配置文件
try {
    const loadConfg = require(`${cwd}/pages.config.js`)
    // 合并配置项
    confg = Object.assign({}, confg, loadConfg)
} catch (error) {
}


const renderData = confg.data

const clear = () => {
    return del(['dist', 'temp'])
}

const style = () => {
    return src('src/assets/styles/*.scss', { base: 'src' })
        .pipe(sass())
        .pipe(dest('temp'))
}

const script = () => {
    return src('src/assets/scripts/*.js', { base: 'src' })
        .pipe(plugins.babel({ presets: [require('@babel/preset-env')] }))
        .pipe(dest('temp'))
}

const page = () => {
    return src('src/*.html', { base: 'src' })
        .pipe(plugins.swig({ data: renderData, defaults: { cache: false } }))
        .pipe(dest('temp'))
}

const image = () => {
    return src('src/assets/images/**', { base: 'src' })
        .pipe(plugins.imagemin())
        .pipe(dest('dist'))
}
const font = () => {
    return src('src/assets/fonts/**', { base: 'src' })
        .pipe(plugins.imagemin())
        .pipe(dest('dist'))
}

const extra = () => {
    return src('public/**', { base: 'public' })
        .pipe(dest('dist'))
}

const serve = () => {
    watch('src/assets/styles/*.scss', style)
    watch('src/assets/scripts/*.js', script)
    watch('src/*.html', page)
    watch([
        'src/assets/images/**',
        'src/assets/fonts/**',
        'public/**'
    ], bs.reload)

    bs.init({
        notify: false,
        port: 8081,
        open: false,
        files: 'temp/**',
        server: {
            baseDir: ['temp', 'src', 'public'],
            routes: {
                '/node_modules': 'node_modules'
            }
        }
    })
}

const useref = () => {
    return src('temp/*.html', { base: 'temp' })
        .pipe(plugins.useref({ searchPath: ['temp', '.']}))
        .pipe(plugins.if(/\.js$/, plugins.uglify()))
        .pipe(plugins.if(/\.css$/, plugins.cleanCss()))
        .pipe(plugins.if(/\.html$/, plugins.htmlmin({ 
            collapseWhitespace: true,
            minifyCSS: true,
            minifyJS: true
        })))
        .pipe(dest('dist'))
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