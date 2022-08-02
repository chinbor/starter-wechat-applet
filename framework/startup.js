import storage from '../utils/storage'

/**
 * 设置 systeminfo
 */
function startup() {
  /**
   * 设置systemInfo
   */
  try {
    const systemInfo = wx.getSystemInfoSync()

    storage.setSync('systemInfo', systemInfo)
  } catch (e) {
    console.error('获取系统信息失败', e)
  }
}

startup()
