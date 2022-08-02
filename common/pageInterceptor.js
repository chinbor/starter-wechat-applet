import { Interceptor, Tracker } from '../framework/index'
import Loading from './ui/loading'
import { switchTabPath } from '../router/config'
import { setPagesOptions } from '../utils/wxHelpers'
import ticker from '../utils/ticker'

function isTab(page) {
  return switchTabPath.indexOf(page.route || page.__route__) > -1
}

Interceptor.addPageInterceptor('onLoad', function (options) {
  // 全局默认屏蔽分享
  wx.hideShareMenu()

  const pages = getCurrentPages()
  const page = pages[pages.length - 1]

  this._session_start = Date.now()
  this.$options = { ...options }
  this.app = getApp()
  this.$page = page
  this.$pages = pages

  // 为每个路由都拼接 __routerLock的options属性，路由中的跳转节流需要用到
  setPagesOptions('__routerLock', false)
  ticker.addTick(this)
})

Interceptor.addPageInterceptor('onShow', function () {
  if (isTab(this.$page)) {
    this._session_start = Date.now()
  }

  // 为每个路由都拼接 __routerLock的options属性，路由中的跳转节流需要用到
  setPagesOptions('__routerLock', false)
  ticker.resume(this)
})

Interceptor.addPageInterceptor('onReady', function () {})

Interceptor.addPageInterceptor('onHide', function () {
  if (isTab(this.$page)) {
    Tracker.page('p_page', this._session_start, Date.now())
  }

  ticker.pause(this)
})

Interceptor.addPageInterceptor('onUnload', function () {
  // 防止请求时的loading未关闭
  Loading && Loading.hideLoading(true)
  Tracker.page('p_page', this._session_start, Date.now())

  ticker.removeTick(this)
})
