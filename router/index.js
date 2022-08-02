import { getPagesCount, getPagesOptions, setPagesOptions } from '../utils/wxHelpers'
import { assemble, stringToObj } from '../utils/url'
import { route, routeMap, switchTabPath, navigatePath, pageMap } from './config'

const routeType = {
  navigateTo: 'navigateTo',
  redirectTo: 'redirectTo',
  reLaunch: 'reLaunch',
  navigateBack: 'navigateBack',
  switchTab: 'switchTab',
}

let beforeEachHandler

function compareTo(a, b) {
  if ((!a || Object.keys(a).length === 0) && (!b || Object.keys(b).length === 0)) {
    return true
  } else if (!a || !b || Object.keys(a).length === 0 || Object.keys(b).length === 0) {
    return false
  }
  const aProps = Object.getOwnPropertyNames(a)
  const bProps = Object.getOwnPropertyNames(b)

  if (aProps.length !== bProps.length) {
    return false
  }

  for (let i = 0; i < aProps.length; i++) {
    const propName = aProps[i]

    if (a[propName] !== b[propName]) {
      return false
    }
  }

  return true
}

function jumpThrottle() {
  if (getPagesOptions('__routerLock')) {
    return false
  }
  setPagesOptions('__routerLock', true)
  return true
}

function navigator(type, path = '', options = {}, success, fail) {
  const _uri = getRealPathAndParam(path, options)
  const { toPath, realPath, realOptions } = _uri

  options = realOptions

  // 如果是跳转直播详情的url（plugin-private://wx2b03c6e691cd7370/pages/live-player-plugin?room_id=xxx），不需要前缀加/字符
  const isAddPrefix = realPath.indexOf('plugin-') !== 0

  const jump = function () {
    const option = {
      url: assemble(realPath, options, isAddPrefix),
    }

    if (type === routeType.switchTab) {
      option.url = realPath
    }

    if (typeof success === 'function') {
      option.success = success
    }
    option.fail = msg => {
      // TODO: 对于需要收集跳转失败的行为可以在这里进行埋点
      if (typeof fail === 'function') {
        fail()
      }
    }

    option.complete = res => {
      // 完成过后需要将页面的__routerLock设置为false
      setPagesOptions('__routerLock', false)
    }

    wx[type](option)
  }

  // 路由的全局守卫，也就是跳转前执行前置操作
  if (beforeEachHandler) {
    try {
      const pageCount = getPagesCount()
      const currentPage = getCurrentPages()[pageCount - 1]
      const currentRoute = currentPage.route || currentPage.__route__

      beforeEachHandler(
        {
          path: routeMap[toPath] || toPath,
          realPath: realPath,
          param: options,
          type,
        },
        {
          path: routeMap[currentRoute] || currentRoute,
          realPath: currentRoute,
          param: currentPage.options,
        },
        function (next) {
          if (next !== false) {
            jump()
          }
        },
      )
    } catch (e) {
      console.warn('beforeEachHandler Error', e)
      jump()
    }
  } else {
    jump()
  }
}

function getRealPathAndParam(path = '', options = {}) {
  const pathArr = /^\/?([^?]+)\??(.*)$/.exec(path) || []

  const toPath = '/' + (pathArr[1] || '')
  const toRoute = route[pathArr[1]] || ''

  // 解析path、可能会带具体的参数比如 /pages/index/index"?a=1、进行标准化
  const realOptions = { ...stringToObj(pathArr[2], false), ...options }
  let realPath = (toRoute && toRoute.path) || toPath

  if (toRoute && toRoute.mapParams && Object.keys(toRoute.mapParams).length) {
    Object.keys(toRoute.mapParams).forEach(key => {
      const value = toRoute.mapParams[key]
      if (realOptions[key]) {
        if (typeof value === 'string') {
          realOptions[value] = realOptions[key]
          delete realOptions[key]
        } else if (typeof value === 'function') {
          const ans = value(key, realOptions[key])
          if (ans && ans.name) {
            realOptions[ans.name] = ans.value
            delete realOptions[key]
          }
        }
      }
    })
  }

  const pathMap = pageMap[realPath]

  if (typeof pathMap === 'function') {
    realPath = pathMap(realPath, realOptions)
  } else if (typeof pathMap === 'string') {
    realPath = pathMap
  }

  return {
    toPath,
    realPath: realPath,
    realOptions: realOptions,
  }
}

function handleNavigate(type, path, options, success, fail) {
  const { realPath, realOptions } = getRealPathAndParam(path, options)

  // 若为 switchTab 页面
  if (type !== routeType.reLaunch && switchTabPath.indexOf(realPath) > -1) {
    navigator(routeType.switchTab, realPath, realOptions, success, fail)
    return
  }

  // 新开页面
  if (type === routeType.navigateTo) {
    const pageCount = getPagesCount()
    const currentPage = getCurrentPages()[pageCount - 1]
    const currentRoute = currentPage.route || currentPage.__route__

    // 若前往页面的路径和参数跟页面栈中的上一个是一致，直接回退；若非一致，新打开
    if (pageCount > 1) {
      const lastPage = getCurrentPages()[pageCount - 2]

      // 兼容直播间跳转商祥lastPage为null
      const lastRoute = lastPage ? lastPage.route || lastPage.__route__ : null
      if (realPath.indexOf(lastRoute) === 0 && compareTo(lastPage.options, realOptions) && switchTabPath.indexOf(currentPage.route) === -1) {
        wx[routeType.navigateBack]({
          delta: 1,
        })
        return
      }
    }

    // 当前页面栈深度不超过7，目前页面栈最大深度为10，需预留3层
    if (pageCount < 7) {
      navigator(routeType.navigateTo, realPath, realOptions, success, fail)
    } else {
      let flag = false
      let item = null

      // 满7层后，正常是替换redirect。若为配置中的current页面，判断是否extra页面，若是，则替换，若不是，则新开页面
      for (let i = 0; i < navigatePath.length; i++) {
        // 为配置中的特殊页面 两个判断break的条件不一样
        const rule = navigatePath[i]
        const { current, destUrl } = rule

        if (current === '*') {
          item = rule
          if (destUrl.indexOf(realPath) > -1) {
            flag = true
            break
          }
        }

        if (current === currentRoute) {
          item = rule
          if (destUrl.indexOf(realPath) > -1) {
            flag = true
          }
          break
        }
      }

      if ((item && item.type === 'open' && (item.isAll || flag)) || (item && item.type === 'replace' && !flag)) {
        navigator(routeType.navigateTo, realPath, realOptions, success, fail)
        return
      }

      navigator(routeType.redirectTo, realPath, realOptions, success, fail)
    }
  } else {
    navigator(type, realPath, realOptions, success, fail)
  }
}

function beforeEach(callback) {
  // beforeEachHandler = callback;
  // 支持多个钩子
  if (beforeEachHandler) {
    const refer = beforeEachHandler

    beforeEachHandler = function (to, from, next) {
      refer(to, from, function (go) {
        if (go !== false) {
          callback && callback(to, from, next)
        }
      })
    }
  } else {
    beforeEachHandler = callback
  }
}

function routeTo(path = '', options = {}, success, fail) {
  if (!jumpThrottle()) {
    return
  }
  handleNavigate(routeType.navigateTo, path, options, success, fail)
}

function redirectTo(path, options, success, fail) {
  handleNavigate(routeType.redirectTo, path, options, success, fail)
}

function goBack(delta = 1) {
  if (getPagesCount() === 1 || !jumpThrottle()) {
    return
  }
  wx[routeType.navigateBack]({
    delta,
  })
}

function reLaunch(path, options, success, fail) {
  if (!jumpThrottle()) {
    return
  }

  handleNavigate(routeType.reLaunch, path, options, success, fail)
}

function switchTab(path, options, success, fail) {
  if (!jumpThrottle()) {
    return
  }

  handleNavigate(routeType.switchTab, path, options, success, fail)
}

export default {
  routeTo,
  redirectTo,
  goBack,
  reLaunch,
  switchTab,
  beforeEach,
}
