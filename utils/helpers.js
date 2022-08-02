import storage from './storage'

/**
 * undefined判定
 */
export const isUndefined = value => typeof value === 'undefined'

/**
 * 对象判定
 */
export function isObject(data) {
  return typeof data === 'object' && Object.prototype.toString.apply(data).slice(8, -1) === 'Object'
}

/**
 * 微信toast弹窗
 */
export function toast(msg, duration = 1500, icon = 'none', mask = false) {
  wx.showToast({ icon, title: msg, duration, mask })
}

/**
 * 日期时间转化为时间戳
 */
export function timeToStamp(time, toUnix = false) {
  try {
    const newTime = time ? new Date(time.replace(/-/g, '/')).getTime() : new Date().getTime()
    return toUnix ? Number(String(newTime).slice(0, -3)) : newTime
  } catch (e) {
    return 0
  }
}

/**
 * 时间戳处理函数
 */
export function timeStamp(date, fmt = 'yyyy-MM-dd hh:mm:ss') {
  const o = {
    'M+': date.getMonth() + 1, // 月份
    'd+': date.getDate(), // 日
    'h+': date.getHours(), // 小时
    'm+': date.getMinutes(), // 分
    's+': date.getSeconds(), // 秒
    'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
    S: date.getMilliseconds(), // 毫秒
  }
  let result = fmt
  if (/(y+)/.test(result)) {
    result = result.replace(RegExp.$1, String(date.getFullYear()).substr(4 - RegExp.$1.length))
  }
  for (const k in o) {
    if (new RegExp('(' + k + ')').test(result)) {
      result = result.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : ('00' + o[k]).substr(String(o[k]).length))
    }
  }
  return result
}

/**
 * 获取菜单按钮（右上角胶囊按钮）的布局位置信息。坐标信息以屏幕左上角为原点。
 */
export function getMenuButtonBoundingClientRect() {
  let systemInfo = storage.get('systemInfo')

  if (!systemInfo) {
    systemInfo = wx.getSystemInfoSync()
  }
  const isIphoneX = systemInfo.model && (systemInfo.model.indexOf('iPhone X') > -1 || systemInfo.model.indexOf('iPhone 11') > -1)

  if (wx.getMenuButtonBoundingClientRect && wx.getMenuButtonBoundingClientRect().top) {
    // 支持胶囊方法
    return wx.getMenuButtonBoundingClientRect()
  } else if (!isIphoneX) {
    // 6/7/8+p
    return {
      bottom: 58,
      height: 32,
      left: 281,
      right: 368,
      top: 26,
      width: 87,
    }
  } else {
    // 取分 x : xr / xs max
    switch (systemInfo.windowWidth) {
      case 375:
        return {
          bottom: 82,
          height: 32,
          left: 281,
          right: 368,
          top: 50,
          width: 87,
        }

      case 414:
      default:
        return {
          top: 12,
          height: 18,
        }
    }
  }
}

/**
 * 节流函数
 */
export function throttle(fn, wait, callnow) {
  let timer = null
  let called = false

  return function () {
    const args = arguments
    const context = this

    if (callnow && !called) {
      fn.apply(context, args)
      called = true
    }

    if (timer) {
      return
    }

    timer = setTimeout(function () {
      clearTimeout(timer)
      fn.apply(context, args)
      timer = null
    }, wait)
  }
}

/**
 * 防抖函数
 */
export function debounce(func, wait, immediate) {
  let timeout
  return function () {
    // eslint-disable-next-line no-invalid-this
    const context = this
    const args = arguments
    if (timeout) {
      clearTimeout(timeout)
    }
    if (immediate) {
      const callNow = !timeout
      timeout = setTimeout(() => {
        clearTimeout(timeout)
        timeout = null
      }, wait)
      if (callNow) {
        func.apply(context, args)
      }
    } else {
      timeout = setTimeout(() => {
        func.apply(context, args)
        clearTimeout(timeout)
      }, wait)
    }
  }
}

/**
 * 样式单位转换
 */
export function rpxToPx(size) {
  const systemInfo = storage.get('systemInfo')
  const windowWidth = systemInfo['windowWidth']
  if (windowWidth && typeof windowWidth === 'number') {
    const rpxToPxScale = windowWidth / 750
    return Math.floor(size * rpxToPxScale)
  } else {
    return Math.floor(size / 2)
  }
}
