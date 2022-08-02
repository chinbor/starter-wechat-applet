function mapRoute(obj) {
  const map = {}
  for (const i in obj) {
    if (obj[i].path) {
      map[obj[i].path] = i
    }
  }
  return map
}

// NOTE: 指明哪些是tab的路径
export const switchTabPath = ['pages/home/index', 'pages/certificate/index', 'pages/userCenter/index']

/**
  层级到达某个程度后，根据配置规则选择跳转方式，这个jb玩意儿没看明白，很扯
  {
      current: '当前页面路径',
      destUrl: ['目标跳转页面路径，可配置多个'],
      type: '页面的跳转方式：replace（替换）和 open（打开）',
      isAll: true || false，当这个参数有值时，意味着当前页面的全部跳转方式按照type的值，忽略destUrl
  }
*/
export const navigatePath = [
  {
    current: '*',
    destUrl: ['pages/loginWx/index'],
    type: 'open',
  },
]

/**
 * 路径映射（兼容改变的路径，例如之前路径文件为 A，之后文件路径改变成了B）
 */
export const pageMap = {
  'pages/index/index': 'pages/home/index',
}

/**
  配置规则

  '统一路由路径': {
      path: '实际路径',
      mapParams: {
          '统一路由参数': '实际参数'，
          '统一路由参数': function (name, value) {
              // 需要参数计算转换时使用，返回最终的键值对
              return {
                  name: 'aa',
                  value: value * 10
              }
          }
      }
  }
*/
export const route = {
  // NOTE: 注意这里的 统一路由路径，跳转可以直接写这里的key值
  home: {
    path: 'pages/index/index',
  },
  certificate: {
    path: 'pages/certificate/index',
  },
  userCenter: {
    path: 'pages/userCenter/index',
  },
  webview: {
    path: 'pages/webview/index',
  },
}

/**
 * 真实路由和统一路由的映射、用route生成、适用在需要知道真实路由对应统一路由的场景
 */
export const routeMap = mapRoute(route)
