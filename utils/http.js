import { apiPrefix } from '../common/config/api'
import { TOKEN } from '../common/config/const'
import storage from './storage'
import authModule from '../modules/auth'
import { clientInfo } from '../common/config/index'
import Base64 from '../utils/base64'
import { track } from '../framework/tracker/shence'

const retryNum = 2

function getUrl(url) {
  if (/^(https?:)?\/\//.test(url)) {
    return url
  } else {
    return apiPrefix + url
  }
}

function getHeader(currentHeader) {
  const header = currentHeader || {}

  // NOTE: 项目不同那么处理逻辑也会不同，所以具体编码规则需要根据你项目出发
  header['content-type'] = header['content-type'] || 'application/json'

  header['Tenant-Id'] = clientInfo.tenantId

  const token = storage.get(TOKEN, undefined)

  if (token) {
    header['Authorization'] = `Bearer ${storage.get(TOKEN)}`
  } else {
    header['Authorization'] = `Basic ${Base64.encode(clientInfo.clientId + ':' + clientInfo.clientSecret)}`
  }

  return header
}

export default class Http {
  constructor() {
    this._retryTimes = 2
  }

  request(url, data, method = 'GET', header, complete) {
    return new Promise((resolve, reject) => {
      const _reject = res => {
        reject(res)
      }

      const _resolve = res => {
        resolve(res)
      }

      wx.request({
        url: getUrl(url),
        data,
        method,
        header: getHeader(header),
        success: res => {
          const statusCode = res.statusCode

          // 针对非200的状态码进行上报
          if (statusCode !== 200) {
            let $network_err = {
              url: getUrl(url),
              data,
              method,
              header,
              statusCode,
            }

            try {
              $network_err = JSON.stringify($network_err) || ''
            } catch (error) {
              $network_err = 'JSON.stringify FAILED'
            }

            track.error.networkErr($network_err)
          }

          if (statusCode === 200) {
            const { code } = res.data

            // NOTE: 框架无code返回，特殊处理
            if (typeof code === 'undefined') {
              _resolve(res)
              return
            }

            // 0代表成功
            if (code !== 0) {
              _reject(res)
            } else {
              _resolve(res)
            }
          } else if (statusCode === 424) {
            // token过期或者非法的错误码
            // 失效清空token值，重新去静默登录
            storage.remove(TOKEN)

            // 重新进行静默登陆获取token信息
            if (this._retryTimes--) {
              Promise.resolve(
                authModule.promise().then(() => {
                  return this.request(url, data, method, header, complete)
                }),
              )
                .then(_resolve)
                .catch(_reject)
            } else {
              this._retryTimes = retryNum
              _reject(res)
            }
          } else {
            _reject(res)
          }
        },
        fail(err) {
          _reject(err)
        },
        complete(res) {
          complete && complete(res)
        },
      })
    })
  }

  get(url, data, header) {
    return this.request(url, data, 'GET', header)
  }

  post(url, data, header) {
    return this.request(url, data, 'POST', header)
  }
}
