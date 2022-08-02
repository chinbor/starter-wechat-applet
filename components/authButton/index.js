// components/authButton/index.js
import auth from '../../modules/auth'
import { toast } from '../../utils/helpers'

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    authType: {
      type: Number,
      value: 1, // 1：电话 2：用户信息
    },
    hasAuth: {
      type: Boolean,
      value: false,
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
    getPhoneNumber(e) {
      // 内部接口全是静默登录
      auth
        .getUserPhone(e)
        .then(res => {
          this.triggerEvent('onFinish', res)
        })
        .catch(err => {
          toast((err && err.msg) || (err && err.data && err.data.msg) || '出现不可预期的错误')
        })
    },

    getUserInfo() {
      // 因为网络请求自动控制异常处理了
      auth.getUserInfo().then(res => {
        this.triggerEvent('onFinish', res)
      })
    },
  },
})
