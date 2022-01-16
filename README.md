> create-pages  是一个简单的自动化构建模块，可以对项目进行打包操作，同时也可以启动本地服务，支持热更新。

#### 命令

> develop 命令： 启动本地服务器
>
> build 命令： 打包文件，并输出至指定目录（默认根目录下的 dist）
>
> clear命令：删除打包和启动本地服务器时产生的文件

在 package.json 的 script 中添加以下命令：

```js
"scripts": {
  "build": "create-pages build",
  "clear": "create-pages clear",
  "serve": "create-pages develop"
}
```

随后就可以使用，**npm run build** 进行打包， **npm run serve** 启动本地服务，结束后可以使用**npm run clear** 清除产生的多余文件。

#### 默认的项目结构如下：

```
├── create.config.js
├── package.json
├── public
|  └── favicon.ico
└── src
|  ├── assets
|  |  ├── fonts
|  |  |  └── pages.woff
|  |  ├── images
|  |  |  └── logo.png
|  |  ├── scripts
|  |  |  └── main.js
|  |  └── styles
|  |     └── main.scss
|  ├── index.html
|  ├── layouts
|  |  └── basic.html

```

public 中放置一些静态资源，打包过程中，会将 public 目录中的文件，copy至项目目录下，不会进行任何额外操作。

src 目录下所有的 html 文件会被打包，html 中的引入文件同样会被打包至指定文件中，但是需要做一点配置。

构建注释的规则，很容易看出来，首先需要两个注释，注释中间即为需要编译内容（可以引入多个，这里以一个为例）， build:css 中的 css 表示引入的内容， 后面的路径是指定编译后的文件，对于多个引入，会编译成一个文件。

```html
<!-- build:css assets/styles/vendor.css -->
<link rel="stylesheet" href="/node_modules/bootstrap/dist/css/bootstrap.css">
<!-- endbuild -->
```

接下来是 asset 中的文件，images 中放置项目中使用到的图片。

fonts 中是项目中用到的字体图标。

styles中放置样式文件，使用 sass 语法。

scripts中是项目中的 js 文件

#### 自定义目录

create.config.js 可以放置自定义选项。默认项为：

```js
data: {}, // html 模板渲染用到的字段
build: {
    src: 'src',                             // 修改 src 目录
    dist: 'dist',                           // 打包完成，文件的输出目录
    temp: 'temp',                           // 打包过程中，临时文件存放位置
    public: 'public',                       // 修改 public 目录
    paths: {
        styles: 'assets/styles/*.scss',     // scss 文件路径
        scripts: 'assets/scripts/*.js',     // js 文件路径
        pages: '*.html',                    // html 页面文件路径
        images: 'assets/images/**',         // 图片存放地址
        fonts: 'assets/fonts/**'            // 字体图标文件路径
    }
}
```

使用时只需在 create.config.js，导出一个对象即可，如下：

```js
module.exports = {
    build: {
        src: 'src',
        dist: 'release',
        temp: '.tmp',
        public: 'public',
        paths: {
          styles: 'assets/styles/*.scss',
          scripts: 'assets/scripts/*.js',
          pages: '*.html',
          images: 'assets/images/**',
          fonts: 'assets/fonts/**'
        }
    },
    data: {
        menus: [
            {
                name: 'Home',
                icon: 'aperture',
                link: 'index.html'
            }
        ],
        date: new Date()
    }
}
```

#### 打包后的路径

```
├── about.html
├── assets
|  ├── fonts
|  ├── images
|  ├── scripts
|  └── styles
├── favicon.ico
└── index.html
```

