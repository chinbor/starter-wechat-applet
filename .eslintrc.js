module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: ['eslint:recommended', 'plugin:prettier/recommended'],
  plugins: ['prettier'],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  globals: {
    // 小程序的全局变量
    __DEV__: true,
    __WECHAT__: true,
    __ALIPAY__: true,
    __wxConfig: true,
    App: true,
    Page: true,
    Component: true,
    Behavior: true,
    wx: true,
    getApp: true,
    getCurrentPages: true,
  },
  ignorePatterns: ['/miniprogram_npm/*.js'],
  rules: {
    'prettier/prettier': 'error',
    'no-console': [
      'error',
      {
        allow: ['warn', 'error'],
      },
    ],
    'no-param-reassign': 0,
    'max-params': 0,
    complexity: 0,
    'no-invalid-this': 1,
    'no-extra-boolean-cast': 2,
    // 禁止不必要的括号 //(a * b) + c;//报错
    'no-extra-parens': 0,
    // 强制所有控制语句使用一致的括号风格
    curly: [2, 'all'],
    // 指定数组的元素之间要以空格隔开(, 后面)， never参数：[ 之前和 ] 之后不能带空格，always参数：[ 之前和 ] 之后必须带空格
    'array-bracket-spacing': [2, 'never'],
    'no-loss-of-precision': 1,
    // 控制逗号前后的空格
    'comma-spacing': [
      2,
      {
        before: false,
        after: true,
      },
    ],
    'linebreak-style': ['error', 'unix'], //换行样式
    quotes: ['error', 'single', { avoidEscape: true }], //单引号
    semi: ['error', 'never'], //分号
    'no-mixed-spaces-and-tabs': [2, false], //禁止混用tab和空格
    'object-curly-spacing': [0, 'never'], //大括号内是否允许不必要的空格
    'no-multiple-empty-lines': [2, { max: 2 }], // 不允许多个空行
    'no-redeclare': 2, //禁止重复声明变量
    'no-trailing-spaces': 1, //一行结束后面不要有空格
    'no-unused-vars': [2, { vars: 'all', args: 'none' }], //不能有声明后未被使用的变量或参数
    'default-case': 2, //switch语句最后必须有default
    'prefer-const': 2, //未被赋值的常量 使用const
    'template-curly-spacing': 1, //强制使用大括号内的间距 Bad: {people.name} 正确{ people.name }
    'brace-style': [2, '1tbs', { allowSingleLine: true }], //大括号风格
    'key-spacing': [2, { beforeColon: false, afterColon: true }], //冒号前后的空格
  },
}
