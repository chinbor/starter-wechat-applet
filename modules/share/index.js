import drawImage from './draw'
import { makeQrcode } from './toolkit'
import Loading from '../../common/ui/loading'
import { assemble } from '../../utils/url'
import { toast } from '../../utils/helpers'
import certificateTemplate from './template/certificate'

export const certificate = certificateTemplate

let shareLock = false
let shareCardLock = false
const MAX = 20
const shareCardImages = []
const shareImages = []

/**
 * 使用对应的模板方法创建分享卡片（朋友聊天框的分享卡片）
 * @param {string} canvasId canvas组件id，传递shareFriends
 * @param {Object} config 分享配置
 * @param {Object} page 页面实例的this
 */
export function getShareImage(canvasId, config, page, slient = true) {
  const { drawType, path } = config
  const pageComp = page.selectComponent('.page')

  if (shareCardLock) {
    console.warn('有图片正在绘制...')
    shareCardLock = false
    return Promise.reject(new Error('有图片正在绘制...'))
  }

  shareCardLock = true

  // 同一张分享图，优先取缓存
  let imageCache
  let imageCacheKey
  if (path) {
    imageCacheKey = `${drawType}:${path}`
    const image = shareCardImages.find(item => item.key === imageCacheKey)
    imageCache = image && image.value
  }

  return new Promise((resolve, reject) => {
    if (imageCache) {
      resolve(imageCache)
      shareCardLock = false
      return
    }

    !slient && Loading.showLoading('生成分享卡片...')
    drawImage(canvasId, config, drawType, pageComp)
      .then(image => {
        // 缓存备用
        if (imageCacheKey) {
          if (MAX && shareCardImages.length >= MAX) {
            shareCardImages.shift()
          }
          shareCardImages.push({ key: imageCacheKey, value: image })
        }
        resolve(image)
      })
      .catch(err => {
        console.error(err)
        reject(err)
      })
      .finally(() => {
        !slient && Loading.hideLoading()
        shareCardLock = false
      })
  })
}

/**
 * 使用对应的模板方法创建带有场景值的海报
 * @param {string} canvasId canvas组件id，传递shareMoments
 * @param {Object} config 分享配置
 * @param {Object} pageComp page组件实例的this
 */
export function downloadSharePhoto(canvasId, config, page, slient = true) {
  const { drawType, scene = {}, path, params } = config
  const pageComp = page.selectComponent('.page')

  // 同一张分享图，优先取缓存
  const imageCacheKey = `${drawType}:${assemble(path, scene)}`
  const image = shareImages.find(item => item.key === imageCacheKey)

  const imageCache = image && image.value

  !slient && Loading.showLoading('正在生成图片...')

  if (imageCache) {
    return new Promise((resolve, reject) => {
      !slient && Loading.hideLoading()
      resolve(imageCache)
    })
  }

  // 生成二维码接口5s内不能重复请求
  if (shareLock) {
    const tip = '点击太快，请稍后再试'
    toast(tip)
    return Promise.reject(tip)
  }

  shareLock = true

  const timer = setTimeout(() => {
    shareLock = false
    clearTimeout(timer)
  }, 6000)

  // 画新图
  return new Promise((resolve, reject) => {
    let p = Promise.resolve()

    // 若存在二维码那么直接使用那边传入的链接地址（若不存在二维码那么直接自己绘制）
    const hasQrcode = !params.qrcode

    hasQrcode && (p = makeQrcode(path, scene))

    p.then(res => {
      // 存在值（说明是生成的二维码链接地址）
      hasQrcode && (config.params = Object.assign(config.params, { qrcode: res.data }))
      return drawImage(canvasId, config, drawType, pageComp)
    })
      .then(image => {
        !slient && Loading.hideLoading()

        // 缓存备用
        if (MAX && shareImages.length >= MAX) {
          shareImages.shift()
        }

        shareImages.push({ key: imageCacheKey, value: image })

        return Promise.resolve(image)
      })
      .then(image => {
        resolve(image)
      })
      .catch(err => {
        console.error(err)
        !slient && Loading.hideLoading()
        !slient && toast('生成海报失败，请稍后再试')
        reject(err)
      })
  })
}
