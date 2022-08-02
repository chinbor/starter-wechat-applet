Component({
  options: {
    addGlobalClass: true,
  },
  /**
   * 组件的属性列表
   */
  properties: {
    checked: {
      type: Boolean,
      value: false,
    },
    disabled: {
      type: Boolean,
      value: false,
    },
    checkedColor: {
      type: String,
      value: '#0077ff',
    },
    noCheckedColor: {
      type: String,
      value: '#ECECEC',
    },
    width: {
      type: String,
      value: '80',
    },
    height: {
      type: String,
      value: '36',
    },
    // 数值与height一样大
    dotSize: {
      type: String,
      value: '36',
    },
    dotColor: {
      type: String,
      value: '#FFF',
    },
  },

  /**
   * 组件的初始数据
   */
  data: {},

  /**
   * 组件的方法列表
   */
  methods: {
    changeStatus() {
      if (!this.data.disabled) {
        this.setData(
          {
            checked: !this.data.checked,
          },
          () => {
            this.triggerEvent('change', this.data.checked)
          },
        )
      }
    },
  },
})
