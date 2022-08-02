// components/dialog/index.js
// 这个组件以api的形式调用 this.selectComponent

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 是否显示遮罩
    overlay: {
      type: Boolean,
      value: false,
    },
    // 点击遮罩是否关闭
    closeOnClickOverlay: {
      type: Boolean,
      value: false,
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    show: false,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    nothing() {
      return
    },
    onClickOverlay() {
      if (this.data.closeOnClickOverlay) {
        this.setData({
          show: false,
        })
      }
    },
    showDialog() {
      this.setData({
        show: true,
      })
    },

    hideDialog(cb) {
      this.setData(
        {
          show: false,
        },
        cb,
      )
    },
  },
})
