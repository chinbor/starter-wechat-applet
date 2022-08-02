// components/bottomModal/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    bgColor: {
      type: String,
      value: '#fff',
    },
    showMask: {
      type: Boolean,
      value: true,
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    active: false,
    hidden: true,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    prevent() {
      return false
    },

    close() {
      this.setData({ active: false }, () => {
        this.doTimeout(() => {
          this.setData({ hidden: true }, () => {
            this.triggerEvent('close')
          })
        })
      })
    },

    show() {
      this.setData({ hidden: false }, () => {
        this.setData({ active: true }, () => {
          this.triggerEvent('show')
        })
      })
    },

    // 这个方法暴露外部使用
    normalClose(callback) {
      this.setData({ active: false }, () => {
        this.doTimeout(() => {
          this.setData({ hidden: true }, () => {
            callback && callback()
          })
        })
      })
    },

    doTimeout(cb, ms = 400) {
      const timeout = setTimeout(() => {
        clearTimeout(timeout)
        cb && cb()
      }, ms)
    },
  },
})
