# 蓉归小程序项目

## 一、目录结构
```sh
ronggui-mini
├── apis                    ----- 全局网络请求目录
│   ├── index.js              ----- 网络请求具体方法
├── common                  ----- 全局共用模块
│   ├── config                ----- 全局配置文件
│   ├── pageInterceptor.js    ----- 页面拦截器（对page的生命周期做一些拦截操作）
│   ├── ui                    ----- 可以封装一些ui层的显示（例如loading）
│   └── wxs                   ----- 微信小程序视图层的处理工具集函数
├── components              ----- 全局组件（一般为所有项目都通用的组件）
├── docs                    ----- 项目文档
│   ├── issues                ----- 项目遇到的问题
│   └── projects              ----- 项目相关说明
├── framework               ----- 框架级别处理
│   ├── interceptor           ----- 拦截器
│   ├── startup.js            ----- 项目启动时需要获取的信息
│   └── tracker               ----- 埋点（使用的神策）
├── images                  ----- 图片目录（tab切换使用本地图片，其余全用oss）
│   ├── icons                 ----- 小icon
├── modules                 ----- 一些比较重的模块化操作
│   ├── auth.js               ----- 授权
│   └── wechat.js             ----- 微信自有功能的封装
├── pages                   ----- 页面
│   ├── home                  ----- 首页
│   ├── certificate           ----- 证书页面
│   ├── userCenter            ----- 用户中心页面
│   └── webview               ----- 封装webview（一般用于第三方活动等h5链接）
├── router                  ----- 路由
│   ├── config.js             ----- 路由相关配置
│   ├── guard.js              ----- 路由守卫（beforeEach）
│   └── index.js              ----- 路由具体实现
├── sdk                     ----- 第三方软件工具集
└── utils                   ----- 工具方法
```

## 二、如何入手

1. 执行 `npm prepare` 安装husky钩子，然后执行`npx husky add .husky/pre-commit 'npx lint-staged'` 和 `npx husky add .husky/commit-msg 'npx --no-install commitlint --edit "$1"'`
2. `project.config.json` 更改appid为你的开发id
3. `package.json` 配置wx字段
4. `npm run init`
5. 全局搜索FIXME 以及 NOTE（会给到相应的提示）
