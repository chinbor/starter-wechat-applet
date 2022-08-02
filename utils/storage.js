const fileStorgeBack = {} // 备份值

const getStorageValue = (value, defaultValue, expireFn) => {
  if (value === null || value === undefined) {
    value = ''
    return defaultValue || value
  }
  const expire = value.expire
  if (expire && /^\d{13}$/.test(expire)) {
    const d = new Date().getTime()
    if (expire <= d) {
      expireFn && expireFn()
      return defaultValue || ''
    }
  }

  return value.value || defaultValue
}

// 本地存储备份方法
const storageBack = {
  set: (key, value) => {
    fileStorgeBack[key] = value
  },
  get: (key, defaultValue) => {
    try {
      const value = fileStorgeBack[key]
      const expireFn = () => {
        delete fileStorgeBack[key]
      }
      return getStorageValue(value, defaultValue, expireFn)
    } catch (e) {
      return ''
    }
  },
  remove: key => {
    delete fileStorgeBack[key]
  },
}

// 本地存储
export default {
  /**
   * 保存值到本地存储
   * @method set
   * @param {String} key     需要保存的键名
   * @param {Object|String|Array|Boolean} value  需要保存的值
   * @param {Number} expires 存储的过期时间
   */
  set: function (key, value, expires) {
    const v = {}
    if (expires) {
      const d = new Date().getTime()
      v.expire = d + expires * 1000
    }
    v.value = value

    try {
      wx.setStorage({
        key: key,
        data: v,
      })
    } catch (e) {
      console.error('setStorage fail:  ' + e)
    }
    storageBack.set(key, v)
  },
  /**
   * 同步保存值到本地存储
   * @method setSync
   * @param {String} key     需要保存的键名
   * @param {Object|String|Array|Boolean} value  需要保存的值
   * @param {Number} expires 存储的过期时间（单位秒）
   */
  setSync: function (key, value, expires) {
    const v = {}

    if (expires) {
      const d = new Date().getTime()
      v.expire = d + expires * 1000
    }

    v.value = value

    try {
      wx.setStorageSync(key, v)
    } catch (e) {
      console.error('setStorageSync fail:  ' + e)
    }
    storageBack.set(key, v)
  },
  /**
   * 需要获取的本地存储
   * @method get
   * @param  {String} key 对应的key
   * @param  {String} defaultValue 如果没有获取值，则使用默认值
   * @return {Object|String|Array|Boolean}  返回值
   */
  get: function (key, defaultValue) {
    let value
    try {
      value = wx.getStorageSync(key)
      const expireFn = () => {
        wx.removeStorageSync(key)
      }
      return getStorageValue(value, defaultValue, expireFn) || storageBack.get(key, defaultValue)
    } catch (e) {
      return storageBack.get(key, defaultValue)
    }
  },
  /**
   * 删除一个本地存储
   * @method remove
   * @param  {String} key 需要删除的key
   */
  remove: function (key) {
    try {
      wx.removeStorageSync(key)
    } catch (e) {
      console.error('removeStorage fail:  ' + e)
    }
    storageBack.remove(key)
  },
}
