// components/img/index.js.js
// 参考文档 https://help.aliyun.com/document_detail/183902.html
// image标签文档地址：https://developers.weixin.qq.com/miniprogram/dev/component/image.html
import imageUtil from '../../utils/imageUtil'

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    width: { type: Number, value: 750 }, // default: 750
    quality: { type: Number, value: 90 }, // default: 80
    url: {
      type: String,
      value: '',
      observer(newVal, oldVal) {
        if (newVal !== oldVal) {
          const { width, quality } = this.properties
          const src = imageUtil.aliCompress(imageUtil.getHost(newVal), width, quality)
          this.setData({ src })
        }
      },
    },
    mode: {
      type: String,
      value: 'aspectFill',
    },
    imageStyle: {
      type: String,
      value: '',
    },
    showMenu: {
      type: Boolean,
      value: false,
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    src: '',
  },

  /**
   * 组件的方法列表
   */
  methods: {
    loadSuccess(event) {
      const { url, src } = this.data

      this.triggerEvent('success', {
        ...event,
        url,
        src,
        msg: 'load success',
        time: Number(new Date()) - this.startTime,
      })
    },
    loadError(event) {
      const { url, src } = this.data

      this.triggerEvent('error', {
        ...event,
        url,
        src,
        msg: event.detail.errMsg,
        time: Number(new Date()) - this.startTime,
      })
    },
  },
})
