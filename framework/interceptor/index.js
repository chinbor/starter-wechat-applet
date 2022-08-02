/*
 * @Author: chinbor.Mn
 * @Date: 2022-06-13 10:14:13
 * @LastEditTime: 2022-06-13 13:20:57
 * @LastEditors: chinbor.Mn
 * @Description: 文件作用主要是对一些方法进行拦截（类似于前置操作），包括App、Page以及Component和Behavior
 * @FilePath: \ronggui-mini\framework\interceptor\index.js
 */

const noop = function () {}
const nonCyclePageInterceptor = []
const nonCyclePageReturnPageInterceptor = { onShareAppMessage: [] }
const appInterceptor = {
  onLaunch: [],
  onShow: [],
  onHide: [],
  onError: [],
}
const pageInterceptor = {
  onLoad: [],
  onReady: [],
  onShow: [],
  onHide: [],
  onUnload: [],
}
const nonCycleComponentInterceptor = []
const nonCycleBehaviorInterceptor = []

function commonIntercept(sourceMethod, interceptList, methodName = '') {
  return function () {
    interceptList.forEach(interceptMethod => {
      interceptMethod.apply(this, Array.prototype.slice.call(arguments).concat([sourceMethod ? sourceMethod.name : methodName]))
    })
    return sourceMethod && sourceMethod.apply(this, arguments)
  }
}

/**
 * 拦截函数返回值
 */
function _combineReturnIntercept(sourceMethod, interceptList) {
  if (!interceptList || !interceptList.length) {
    return sourceMethod
  }

  return function () {
    let ret = sourceMethod && sourceMethod.apply(this, arguments)

    interceptList.forEach(interceptMethod => {
      ret = interceptMethod.apply(this, [ret].concat(Array.prototype.slice.call(arguments)))
    })

    return ret
  }
}

function initPage(pageObject) {
  Object.keys(pageInterceptor).forEach(cycleMethod => {
    if (!pageObject[cycleMethod]) {
      pageObject[cycleMethod] = noop
    }
  })
  Object.keys(pageObject).forEach(keyName => {
    if (typeof pageObject[keyName] === 'function') {
      const sourceMethod = pageObject[keyName]

      if (pageInterceptor[keyName]) {
        // 生命周期方法
        pageObject[keyName] = commonIntercept(sourceMethod, pageInterceptor[keyName])
      } else {
        pageObject[keyName] = commonIntercept(sourceMethod, nonCyclePageInterceptor)

        // 拦截方法的返回
        pageObject[keyName] = _combineReturnIntercept(pageObject[keyName], nonCyclePageReturnPageInterceptor[keyName])
      }
    }
  })
  return wxPage(pageObject)
}

function initComponent(componentObject) {
  const methods = componentObject.methods
  if (methods) {
    Object.keys(methods).forEach(keyName => {
      const sourceMethod = methods[keyName]
      methods[keyName] = commonIntercept(sourceMethod, nonCycleComponentInterceptor)
    })
  }
  return wxComponent(componentObject)
}

function initBehavior(behaviorObject) {
  const methods = behaviorObject.methods
  if (methods) {
    Object.keys(methods).forEach(keyName => {
      const sourceMethod = methods[keyName]
      methods[keyName] = commonIntercept(sourceMethod, nonCycleBehaviorInterceptor)
    })
  }
  return wxBehavior(behaviorObject)
}

const wxApp = App

const wxPage = Page

const wxComponent = Component

const wxBehavior = Behavior

Page = function (pageObject) {
  return initPage(pageObject)
}

if (wxComponent) {
  Component = function (componentObject) {
    return initComponent(componentObject)
  }
}

if (wxBehavior) {
  Behavior = function (behaviorObject) {
    return initBehavior(behaviorObject)
  }
}

export default {
  /**
   * 增加对App生命周期方法的拦截器
   * @param cycleMethodName
   * @param handler
   */
  addAppInterceptor(cycleMethodName, handler) {
    appInterceptor[cycleMethodName].push(handler)
  },

  /**
   * 增加对Page生命周期方法的拦截器
   * @param cycleMethodName
   * @param handler
   */
  addPageInterceptor(cycleMethodName, handler) {
    pageInterceptor[cycleMethodName].push(handler)
  },

  /**
   * 拦截Page中除了生命周期方法以外的所有方法
   * @param handler
   */
  addPageInterceptorAllExceptCycle(handler) {
    nonCyclePageInterceptor.push(handler)
  },

  /**
   * 拦截Page中除生命周期方法以外指定方法的返回值
   * @param methodName
   * @param handler
   */
  addPageInterceptorAllExceptCycleReturn(methodName, handler) {
    if (!nonCyclePageReturnPageInterceptor[methodName]) {
      nonCyclePageReturnPageInterceptor[methodName] = []
    }

    nonCyclePageReturnPageInterceptor[methodName].push(handler)
  },

  /**
   * 拦截Component所有方法
   * @param handler
   */
  addComponentInterceptorAllExceptCycle(handler) {
    nonCycleComponentInterceptor.push(handler)
  },

  /**
   * 拦截Behavior所有方法
   * @param handler
   */
  addBehaviorInterceptorAllExceptCycle(handler) {
    nonCycleBehaviorInterceptor.push(handler)
  },

  VApp(appObject) {
    Object.keys(appInterceptor).forEach(cycleMethod => {
      const sourceMethod = appObject[cycleMethod]
      appObject[cycleMethod] = commonIntercept(sourceMethod, appInterceptor[cycleMethod], cycleMethod)
    })
    return wxApp(appObject)
  },

  VPage(pageObject) {
    return initPage(pageObject)
  },

  VComponent(componentObject) {
    return initComponent(componentObject)
  },

  VBehavior(behaviorObject) {
    return initBehavior(behaviorObject)
  },
}
