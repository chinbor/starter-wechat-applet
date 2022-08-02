import storage from './storage'

// 获取当前页面路径
export function getCurrentPageRoute() {
  const pageStack = getCurrentPages()
  const length = pageStack.length
  const page = pageStack[length - 1]
  return page ? page.route || page.__route__ || '' : ''
}

// 检测版本（一般用于微信sdk版本过低判断）
export function checkVersion(targetVersion, type = 'SDKVersion') {
  let isSupport = true
  try {
    const res = wx.getSystemInfoSync()
    if (res && res[type]) {
      const targetArr = targetVersion.toString().split('.')
      const localArr = res[type].toString().split('.')
      let local = 0
      let target = 0
      const maxLen = Math.max(targetArr.length, localArr.length)
      for (let i = 0; i < maxLen; i++) {
        local = parseInt(localArr[i], 10) || 0
        target = parseInt(targetArr[i], 10) || 0
        if (local < target) {
          isSupport = false
          break
        } else if (local > target) {
          isSupport = true
          break
        }
      }
    } else {
      isSupport = false
    }
  } catch (e) {
    isSupport = false
  }

  return isSupport
}

// 检测是否有更新
export function checkUpdate() {
  if (wx.getUpdateManager) {
    const updateManager = wx.getUpdateManager()
    const toast = title => wx.showToast({ title, icon: 'none' })

    updateManager.onCheckForUpdate(res => res.hasUpdate && toast('已发现新版本'))
    updateManager.onUpdateFailed(() => toast('小程序更新失败，稍后重试'))
    updateManager.onUpdateReady(() => {
      wx.showModal({
        title: '提示',
        content: '新版本准备好了，即将更新',
        showCancel: false,
        success() {
          updateManager.applyUpdate()
        },
      })
    })
  }
}

// 当前页面长度
export function getPagesCount() {
  const pages = getCurrentPages()
  return pages ? pages.length : 0
}

// 当前页面参数
export function getPagesOptions(key) {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = currentPage ? currentPage.options : {}
  if (key) {
    return options[key]
  } else {
    return options
  }
}

// 设置当前页面参数
export function setPagesOptions(key, val) {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = currentPage && currentPage.options

  if (options) {
    options[key] = val
  } else {
    currentPage.options = { [key]: val }
  }
}

/**
 * 获取系统信息systemInfo，用于先获取storage，获取不到再获取wx的
 * @param {String} key 获取的信息key，为空时获取整个系统信息对象
 */
export function getSystemInfo(key = '') {
  let systemInfo = null
  let value = null
  if (key === 'windowHeight') {
    // 获取windowHeight有坑，因为有tabbar的页面和没有tabbar页面时，值不一样，需要实时获取
    systemInfo = wx.getSystemInfoSync()
    value = systemInfo && systemInfo[key]
  } else {
    systemInfo = storage.get('systemInfo') || wx.getSystemInfoSync()
    if (systemInfo && key && systemInfo[key]) {
      value = systemInfo[key]
    } else {
      value = systemInfo
    }
  }
  return value
}
