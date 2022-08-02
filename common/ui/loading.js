// loading弹窗
let _ban = false
let _state = false
let _count = 0

const Loading = {
  set ban(v) {
    _ban = v ? true : false
    if (v) {
      wx.hideLoading()
    } else {
      _state && this.showLoading(..._state)
    }
  },
  get ban() {
    return _ban
  },
  showLoading: function (title, mask, callback) {
    if (_ban) {
      return false
    }
    _state = { title, mask, callback }
    _count++
    wx.showLoading({
      title: title || '加载中',
      mask: mask || true,
      complete: function (res) {
        callback && callback(res)
      },
    })
  },
  hideLoading: function (isForce) {
    _count--
    if (_count < 1 || isForce) {
      _count = 0
      wx.hideLoading()
    }
  },
}

module.exports = Loading
