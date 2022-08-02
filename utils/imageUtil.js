// 图片处理工具
import { https } from './url'
import { aliOssHost } from '../common/config/api'

const hostArr = [aliOssHost]
const urlPatten = /^(?:https?:)?\/\//i

const imageUtil = {
  aliCompress(imgUrl = '', resizeWidth = 750, quality = 80) {
    if (!imgUrl.startsWith(aliOssHost)) {
      return imgUrl
    }

    const imgWidth = Math.ceil((wx.memory.get('screenWidth') / 375) * resizeWidth)

    let [url, query = ''] = imgUrl.split('?')
    url = https(url)
    query += query.length ? '&' : '?'
    query += `x-oss-process=image/resize,w_${imgWidth}/quality,q_${quality}`

    return url + query
  },

  /**
   * 添加图片域名,如果url中已经有http头，则只改为https,如果没有http头，则补上https和随机图片域名
   */
  getHost: function (smallImage) {
    const searchIndex = smallImage.search(urlPatten)
    if (searchIndex >= 0) {
      // 如果url中已经有http头，则只改为https
      smallImage = smallImage.replace(urlPatten, 'https://')
      return smallImage
    } else {
      // 没有http头，则补上https和随机图片域名
      const random = Math.floor(Math.random() * hostArr.length)
      smallImage = smallImage.replace(/^\//, '')
      return hostArr[random].concat('/' + smallImage)
    }
  },
}

export default imageUtil
