import Http from '../utils/http'
import Loading from '../common/ui/loading'
import { toast } from '../utils/helpers'

function getErrorCode2text(code) {
  let message = 'Request Error'

  switch (code) {
    case 400:
      message = '请求错误'
      break
    case 401:
      message = '未授权，请登录后重试'
      break
    case 403:
      message = '拒绝访问'
      break
    case 404:
      message = '访问资源不存在'
      break
    case 408:
      message = '请求超时'
      break
    case 500:
      message = '位置错误'
      break
    case 501:
      message = '承载服务未实现'
      break
    case 502:
      message = '网关错误'
      break
    case 503:
      message = '服务暂不可用'
      break
    case 504:
      message = '网关超时'
      break
    case 505:
      message = '暂不支持的 HTTP 版本'
      break
    default:
      message = '位置错误'
  }

  return message
}

// url参数可以填写完整的url也可以只写path部分，最后一个silent表示是否静默请求，也就是不会进行loading以及toast的提示
export default function fetch(url, data, method, header, complete, silent = false, title) {
  return new Promise((resolve, reject) => {
    !silent && Loading.showLoading(title)

    const http = new Http()

    http
      .request(url, data, method, header, complete)
      .then(res => {
        !silent && Loading.hideLoading()
        // http内部已经处理成了data属性值，外部需要看见的是决议成功的值！！
        resolve(res.data)
      })
      .catch(err => {
        // 这里的err可能是返回结果res也可能是捕获到的err（不需要再往外部决议了！！因为异常处理及提示都在http中进行了）
        if (!silent) {
          // 关闭loading后再弹窗错误消息
          Loading.hideLoading()
          if (err instanceof Error) {
            // 一定放在hideLoading前
            toast(err.msg || '出现不可预期的错误')
          } else {
            const { data: { msg } = {}, statusCode } = err

            if (statusCode !== 200) {
              toast(msg || getErrorCode2text(statusCode))
            } else {
              toast(msg || '出现不可预期的错误')
            }
          }
        }

        reject(err)
      })
  })
}
