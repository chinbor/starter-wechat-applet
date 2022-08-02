import storage from '../utils/storage'
import { LOGIN_CODE, TOKEN, USER_INFO } from '../common/config/const'
import wechatModule from './wechat'
import userModel from '../apis/userCenter/index'
import Loading from '../common/ui/loading'

export function updateUserInfo(key, userInfo) {
  const _userInfo = storage.get(key, {})
  storage.setSync(key, { ..._userInfo, ...userInfo })
}

export default {
  promise() {
    const clear = () => delete this.__loginPromise

    if (this.__loginPromise) {
      return this.__loginPromise
    } else {
      this.__loginPromise = new Promise((resolve, reject) => {
        const _resolve = res => {
          resolve(res)
        }

        const _reject = err => {
          reject(err)
        }

        if (this.hasToken()) {
          _resolve({
            token: storage.get(TOKEN),
            userInfo: storage.get(USER_INFO),
          })
        } else {
          this.autoLogin().then(_resolve).catch(_reject)
        }
      }).finally(clear)
      return this.__loginPromise
    }
  },

  hasToken() {
    const token = storage.get(TOKEN, '')

    return !!token
  },

  autoLogin() {
    return new Promise((resolve, reject) => {
      this.getLoginCode()
        .then(_code => {
          return userModel.login(_code, true).then(res => {
            const { access_token, expires_in, user_info: { id } = {} } = res

            // 存取token到缓存，因为后续接口需要token
            storage.setSync(TOKEN, access_token, expires_in)

            return userModel.getUserInfo(id, true).then(res => {
              const userInfo = res || {}

              userInfo && storage.setSync(USER_INFO, userInfo)

              resolve({
                token: access_token,
                userInfo,
              })
            })
          })
        })
        .catch(reject)
    })
  },

  // 获取登录凭证 支持参数forceGetCode，继续调用wx.login
  getLoginCode(forceGetCode = true) {
    return new Promise((resolve, reject) => {
      const loginCode = storage.get(LOGIN_CODE, undefined)

      if (!forceGetCode && loginCode) {
        resolve(loginCode)
      }

      wechatModule
        .getLoginCode()
        .then(code => {
          // 微信换取的code有效期为5分钟，所以这里可以设置一个3分钟的时间戳！
          storage.setSync(LOGIN_CODE, code, 180)
          resolve(code)
        })
        .catch(err => {
          const message = err instanceof Error ? String(err) : JSON.stringify(err)
          const errorInfo = {
            type: 'wxsmall-get-logincode-fail',
            message,
          }
          reject(errorInfo)
        })
    })
  },

  // 获取手机号码 https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/getPhoneNumber.html
  getUserPhone(e) {
    return new Promise((resolve, reject) => {
      const { code, iv, encryptedData } = e.detail

      const handleRes = res => {
        const { data: phone } = res

        if (phone) {
          updateUserInfo(USER_INFO, { phone })

          resolve({ phone })
        } else {
          return Promise.reject()
        }
      }

      if (code) {
        Loading.showLoading()

        // 静默，所以自己处理异常
        userModel
          .bindPhoneNum({ code }, true)
          .then(res => {
            Loading.hideLoading()
            return handleRes(res)
          })
          .catch(err => {
            Loading.hideLoading()
            reject(err)
          })
      } else if (iv && encryptedData) {
        Loading.showLoading()

        this.getLoginCode()
          .then(code => {
            userModel
              .bindPhoneNum({ iv, encryptedData, code }, true)
              .then(res => {
                Loading.hideLoading()
                return handleRes(res)
              })
              .catch(err => {
                Loading.hideLoading()
                reject(err)
              })
          })
          .catch(reject)
      }
    })
  },

  // 获取用户信息
  getUserInfo() {
    return new Promise((resolve, reject) => {
      const getUserProfile = wx.getUserProfile || wx.getUserInfo

      getUserProfile({
        desc: '需要获取您的用户信息',
        success(res) {
          const { userInfo } = res

          if (userInfo) {
            const data = {
              avatar: userInfo.avatarUrl,
              nickName: userInfo.nickName,
            }

            // 非静默，不需要自己处理异常，全局已经处理
            userModel
              .updateUserInfo({
                userBase: data,
              })
              .then(() => {
                updateUserInfo(USER_INFO, data)
                resolve(data)
              })
          } else {
            reject()
          }
        },
        fail(err) {
          console.error('getUserInfo', err)
          reject(err)
        },
      })
    })
  },
}
