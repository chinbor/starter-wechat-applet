import './utils/promise'
import './framework/startup'
import './utils/memory'
import './common/pageInterceptor'
import { Interceptor } from './framework/index'
import storage from './utils/storage'
import { checkUpdate, checkVersion } from './utils/wxHelpers'
import { getMenuButtonBoundingClientRect } from './utils/helpers'
import './router/guard'
import { track } from './framework/tracker/shence'

// NOTE: 启动时就初始化神策sdk
// import { shenceInit } from './framework/tracker/shence'
// shenceInit()

// app.js
Interceptor.VApp({
  onLaunch() {
    try {
      let systemInfo = storage.get('systemInfo')

      if (!systemInfo) {
        systemInfo = wx.getSystemInfoSync()
      }

      wx.memory.set({
        isIOS: systemInfo.system && systemInfo.system.toLowerCase().indexOf('ios') > -1,
        isIphoneX: systemInfo.model && (systemInfo.model.indexOf('iPhone X') > -1 || systemInfo.model.indexOf('iPhone 11') > -1),
        windowWidth: systemInfo.windowWidth,
        windowHeight: systemInfo.windowHeight,
        safeArea: systemInfo.safeArea,
        statusBarHeight: systemInfo.statusBarHeight,
        screenWidth: systemInfo.screenWidth,
        screenHeight: systemInfo.screenHeight,
        menuButton: getMenuButtonBoundingClientRect(),
      })
    } catch (e) {
      console.error('获取系统信息失败', e)
    }
  },

  onShow(options) {
    // 检查小程序版本，进而提示升级版本
    checkUpdate()

    // 检测更新
    if (!checkVersion('2.23.4')) {
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，为完整使用小程序，建议更新至最新版',
        showCancel: false,
        success() {},
      })
    }
  },

  onHide() {},

  onError(err) {
    console.error(err)

    track.error.scriptOrApiUseErr('脚本错误、API 调用报错等前端内部错误')
  },

  onPageNotFound(res) {
    console.error(res)

    track.error.pageNotFoundErr('页面未找到（打开不存在的页面或者跳转不存在页面）')
  },

  onUnhandledRejection({ reason }) {
    console.error(reason)

    track.error.unhandledRejectionErr('未处理的 Promise 拒绝事件')
  },
})
