export default {
  getLoginCode() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: function (res) {
          resolve(res.code)
        },
        fail: reject,
      })
    })
  },
  // 打开客服
  openCustomerService() {
    return new Promise((resolve, reject) => {
      wx.openCustomerServiceChat({
        // FIXME: 替换为真实地址
        extInfo: { url: '客服地址' },
        corpId: '企业id',
        success: resolve,
        fail: reject,
      })
    })
  },
}
