/* eslint-disable prefer-const */
import * as shareModule from './index'
import { checkVersion } from '../../utils/wxHelpers'

let imgList = []
const tempFileList = {}
let imagesRequestPromises = []

export default function (canvasId = 'shareFriends', config, drawType, pageComp) {
  const getTemplate = shareModule[config.type]
  return new Promise((resolve, reject) => {
    if (getTemplate) {
      const template = getTemplate(config.params, drawType)
      createImage(canvasId, template, pageComp)
        .then(image => {
          resolve(image)
        })
        .catch(err => {
          console.error('生成卡片分享图失败 - ', err)
          reject(err)
        })
    } else {
      const err = 'template not found'
      reject(err)
    }
  })
}

/**
 * 使用对应的模板方法创建图片
 *
 * @param {*} canvasId
 * @param {*} template
 */
export function createImage(canvasId, template, pageComp) {
  let context = null
  let image = null
  return downLoadImages(template)
    .then(() => {
      // console.log('图片资源下载完成')
      return draw(canvasId, template, pageComp)
    })
    .then(ctx => {
      context = ctx
      return outputCanvasFile(canvasId, ctx, pageComp)
    })
    .then(file => {
      image = file
      return resetCanvas(context)
    })
    .then(() => {
      return image
    })
}

/**
 * 输出 canvas 图片文件
 * @param {string} ctx
 * @param {Object} pageComp page组件实例的this
 * @returns
 */
export function outputCanvasFile(canvasId, ctx = {}, pageComp) {
  // console.log('outputCanvasFile ctx - ', ctx)
  return Promise.resolve().then(
    () =>
      new Promise((resolve, reject) => {
        const option = {
          canvasId: canvasId,
          fileType: 'jpg',
          quality: 1,
          success(res) {
            resolve(res.tempFilePath)
          },
          fail(res) {
            console.error(res)
            reject(res)
          },
        }
        wx.canvasToTempFilePath(option, pageComp)
      }),
  )
}

/**
 * 重置 canvas 画布
 */
export function resetCanvas(ctx) {
  // return ctx.draw(true) // for test
  const { width, height } = ctx

  ctx.clearRect(0, 0, width, height)
  // 底色
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, width, height)

  return ctx.draw(false)
}

/**
 * 下载图片资源
 */
function downLoadImages(template) {
  const { elements } = template
  imagesRequestPromises = []
  imgList = []
  elements.forEach(elem => {
    if (elem.type === 'image') {
      imgList.push(elem.url)
    }
    // if (elem.type === 'image') imgList.push(elem.url)
  })
  if (imgList && imgList.length) {
    imgList.forEach(img => {
      imagesRequestPromises.push(getImageInfo(img))
    })
  }

  return Promise.all(imagesRequestPromises)
}

function getImageInfo(src) {
  if (!src) {
    return
  }
  return new Promise((resolve, reject) => {
    wx.getImageInfo({
      src,
      success(res) {
        tempFileList[src] = res.path
        resolve(res)
      },
      fail(err) {
        resolve()
        console.error('图片下载失败', err, src)
      },
    })
  })
}

/**
 * 绘制模板元素
 * @param {Object} pageComp page组件实例的this
 */
function draw(canvasId, template, pageComp) {
  return new Promise((resolve, reject) => {
    const { width, height, background, elements } = template

    const ctx = wx.createCanvasContext(canvasId, pageComp)
    // 重设画板
    ctx.clearRect(0, 0, width, height)
    // 背景
    if (background && background.color) {
      ctx.fillStyle = background.color
      ctx.fillRect(0, 0, width, height)
      ctx.draw()
    }

    // 绘制元素
    elements.forEach(elem => {
      ctx.save()
      switch (elem.type) {
        case 'image':
          drawImage(ctx, elem)
          break
        case 'text':
          drawText(ctx, elem)
          break
        case 'textWrap':
          drawTextWrap(ctx, elem)
          break
        case 'square':
          drawRect(ctx, elem)
          break
        default:
          break
      }
      ctx.restore()
    })

    const drawTimeout = ctx.draw(
      true,
      setTimeout(() => {
        clearTimeout(drawTimeout)
        resolve(ctx)
      }, 500),
    )
  })
}

/**
 *  计算text多少行 1.9.9以下版本
 *  如果是数字和英文会有差异 会计算不准
 * @param context
 * @param text
 * @param fontSize
 * @param width
 * @returns {Array}
 */
function getTextLineOld(context, text, fontSize, width) {
  const textList = []
  const itemSize = Math.ceil(width / fontSize) // 每行放多少个字，不准，
  const row = Math.ceil(text.length / itemSize) // 总行数
  for (let i = 0; i < row; i++) {
    const lineText = text.substring(itemSize * i, itemSize * (i + 1))
    textList.push(lineText)
  }
  return textList
}

/**
 * 计算text多少行 1.9.9以上版本
 * @param context
 * @param text
 * @param fontSize
 * @param width
 * @returns {Array}
 */
function getTextLine(context, text, fontSize, width) {
  context.setFontSize(fontSize) // 先设置字体大小
  const textList = []
  let lineText = ''
  const charList = text.split('')
  for (let i = 0; i < charList.length; i++) {
    const lineTextLast = lineText + charList[i]
    const metrics = context.measureText(lineTextLast) // 计算当前字符串的宽度
    if (metrics.width > width && i > 0) {
      textList.push(lineText)
      lineText = charList[i] // 下一行的启始为刚计算的最后一个字符
    } else {
      lineText = lineTextLast // 没有超过最大width就继续累加
    }
    if (i === charList.length - 1) {
      textList.push(lineText)
    }
  }
  return textList
}

/**
 * 绘制多行文字
 * @param {Object} ctx canvas上下文
 * @param {Object} elem 模板元素
 * @param {string} elem.line 文本内容
 * @param {number} elem.x 文字的左上角 x坐标
 * @param {number} elem.y 文字的左上角 y坐标
 * @param {number} elem.width 文字的宽度
 * @param {number} elem.fontSize 文字大小
 * @param {string} elem.fontColor 文字颜色
 * @param {string} elem.verticalAlign 垂直对齐
 * @param {string} elem.fontWeight 字重
 * @param {string} elem.fontFamily 字体
 * @param {string} elem.textAlign 文字对齐
 * @param {number} elem.lineHeight 文字大小
 * @param {string} elem.style 文字装饰
 * @param {number} elem.numberOfLines 文字行数
 */
function drawTextWrap(ctx, elem) {
  let {
    line = '',
    x = 0,
    y = 0,
    width,
    fontSize = 28,
    fontColor = '#2c2c2c',
    verticalAlign = 'top',
    fontWeight = 'normal',
    fontFamily = 'sans-serif',
    textAlign = 'left',
    lineHeight = 20,
    style = '',
    numberOfLines = 1,
  } = elem
  try {
    if (typeof x === 'function') {
      x = x(ctx)
    }
    const fontSetting = `normal ${fontWeight} ${fontSize}px ${fontFamily}`
    ctx.font = fontSetting
    ctx.beginPath()
    ctx.setTextAlign(textAlign)
    ctx.fillStyle = fontColor
    ctx.setTextBaseline(verticalAlign)

    let textList = []
    // 如果包含数字和英文会计算不准,所以新版需要用新方法计算
    if (checkVersion('1.9.9')) {
      textList = getTextLine(ctx, line, fontSize, width)
    } else {
      textList = getTextLineOld(ctx, line, fontSize, width)
    }
    // 多行文本
    if (numberOfLines > 1) {
      const computedMaxLine = textList.length
      if (computedMaxLine <= numberOfLines) {
        for (let i = 0; i < computedMaxLine; i++) {
          ctx.fillText(textList[i], x, y + lineHeight * i, width)
        }
      } else {
        for (let i = 0; i < numberOfLines; i++) {
          let lineText = textList[i]
          // 最后一行
          if (i === numberOfLines - 1) {
            lineText = lineText.substring(0, lineText.length - 1) + '...'
          }
          ctx.fillText(lineText, x, y + lineHeight * i, width)
        }
      }
    } else {
      // 溢出省略
      let lineText = textList[0]
      if (textList.length > 1) {
        lineText = lineText.substring(0, lineText.length - 1) + '...'
      }
      ctx.fillText(lineText, x, y, width)
    }

    if (style) {
      drawTextLine(ctx, x, y, style, fontColor, fontSize, line)
    }
  } catch (e) {
    console.error('drawText err', e)
  }
}

/**
 * 绘制图片
 * @param {Object} ctx canvas上下文
 * @param {Object} elem 模板元素
 * @param {string} elem.url 图片路径
 * @param {number} elem.x 图片的左上角 x坐标
 * @param {number} elem.y 图片的左上角 y坐标
 * @param {number} elem.w 图片的宽度
 * @param {number} elem.h 图片的高度
 * @param {Boolean} elem.clip 是否剪切成圆形
 * @param {number} elem.borderRadius 圆角
 * @param {Object} elem.borderRadiusTRBL 圆角
 */
function drawImage(ctx, elem) {
  const {
    url,
    width,
    height,
    x,
    y,
    clip = false,
    borderRadius = 0,
    borderRadiusTRBL = {
      t: 0,
      r: 0,
      b: 0,
      l: 0,
    },
  } = elem
  const imgUrl = url
  const tempUrl = tempFileList[imgUrl]

  if (tempUrl) {
    if (clip) {
      ctx.beginPath()
      ctx.arc(x + width / 2, y + height / 2, width / 2, 0, 2 * Math.PI)
      ctx.clip()
    }
    if (borderRadius) {
      drawBorderRadius(ctx, elem)
      ctx.clip()
    }
    if (borderRadiusTRBL && (borderRadiusTRBL.t || borderRadiusTRBL.r || borderRadiusTRBL.b || borderRadiusTRBL.l)) {
      drawBorderRadiusOnly(ctx, elem)
      ctx.clip()
    }
    ctx.drawImage(tempUrl, x, y, width, height)
  }
}

/**
 * 绘制文字
 * @param {Object} ctx canvas上下文
 * @param {Object} elem 模板元素
 * @param {string} elem.line 文本内容
 * @param {number} elem.x 文字的左上角 x坐标
 * @param {number} elem.y 文字的左上角 y坐标
 * @param {number} elem.width 文字的宽度
 * @param {number} elem.fontSize 文字大小
 * @param {string} elem.fontColor 文字颜色
 * @param {string} elem.verticalAlign 垂直对齐
 * @param {string} elem.fontWeight 字重
 * @param {string} elem.fontFamily 字体
 * @param {string} elem.textAlign 文字对齐
 * @param {number} elem.lineHeight 文字大小
 * @param {string} elem.style 文字装饰
 * @param {number} elem.numberOfLines 文字行数
 */
function drawText(ctx, elem) {
  let {
    line = '',
    x = 0,
    y = 0,
    width,
    fontSize = 28,
    fontColor = '#2c2c2c',
    verticalAlign = 'top',
    fontWeight = 'normal',
    fontFamily = 'sans-serif',
    textAlign = 'left',
    lineHeight = 20,
    style = '',
    numberOfLines = 1,
  } = elem

  const fontSetting = `normal ${fontWeight} ${fontSize}px ${fontFamily}`
  ctx.font = fontSetting
  const metrics = ctx.measureText(line)
  const length = line.length
  const maxLength = Math.floor(length * ((width * numberOfLines) / metrics.width)) || length
  const lengthOfPerLine = Math.ceil(maxLength / numberOfLines) || length

  ctx.beginPath()
  ctx.setTextAlign(textAlign)
  ctx.fillStyle = fontColor
  ctx.setTextBaseline(verticalAlign)

  // 多行文本
  if (numberOfLines > 1) {
    for (let i = 0; i < numberOfLines; i++) {
      let curLine = ''
      // 最后一行...
      if (i === numberOfLines - 1) {
        const curLineText = line.substring(lengthOfPerLine * i, lengthOfPerLine * (i + 1) - 1)
        const curLineMetrics = ctx.measureText(curLineText)
        // 溢出省略
        if (width && width < curLineMetrics.width) {
          curLine = curLineText + '...'
        } else {
          curLine = curLineText
        }
      } else {
        curLine = line.substring(lengthOfPerLine * i, lengthOfPerLine * (i + 1))
      }
      ctx.fillText(curLine, x, y + lineHeight * i, width)
    }
  } else {
    // 溢出省略
    if (width && width * numberOfLines < metrics.width) {
      line = line.substring(0, maxLength) + '...'
    }
    ctx.fillText(line, x, y, width)
  }

  if (style) {
    drawTextLine(ctx, x, y, style, fontColor, fontSize, line)
  }
}

/**
 * 绘制文字装饰
 * @param {Boolean} elem.style 文字样式 -underline下划线；-line-through删除线
 */
function drawTextLine(ctx, x, y, style, color, fontSize, content) {
  if (style === 'underline') {
    drawRect(ctx, {
      backgroundColor: color,
      y: y + fontSize * 1.2,
      x: x - 1,
      width: ctx.measureText(content).width + 3,
      height: 1,
    })
  } else if (style === 'line-through') {
    drawRect(ctx, {
      backgroundColor: color,
      y: y + fontSize * 0.6,
      x: x - 1,
      width: ctx.measureText(content).width + 3,
      height: 1,
    })
  }
}

/**
 * 绘制矩形
 * @param {Object} ctx canvas上下文
 * @param {Object} elem 模板元素
 * @param {number} elem.x 矩形的左上角 x坐标
 * @param {number} elem.y 矩形的左上角 y坐标
 * @param {number} elem.width 矩形的宽度
 * @param {number} elem.height 矩形的高度
 * @param {string} elem.borderColor 背景颜色
 * @param {number} elem.borderRadius 圆角
 * @param {string} elem.borderColor 边框颜色
 */
function drawRect(ctx, elem) {
  const {
    x = 0,
    y = 0,
    width = 0,
    height = 0,
    backgroundColor,
    borderRadius = 0,
    borderColor = '',
    shadow = null,
    borderRadiusTRBL = {
      t: 0,
      r: 0,
      b: 0,
      l: 0,
    },
  } = elem

  if (shadow) {
    const { offsetX, offsetY, blur, color } = shadow
    ctx.setShadow(offsetX, offsetY, blur, color)
  }

  if (borderRadius || (borderRadiusTRBL && (borderRadiusTRBL.t || borderRadiusTRBL.r || borderRadiusTRBL.b || borderRadiusTRBL.l))) {
    if (borderRadius) {
      drawBorderRadius(ctx, elem)
    } else {
      drawBorderRadiusOnly(ctx, elem)
    }
    if (borderColor) {
      ctx.strokeStyle = borderColor
      ctx.stroke()
    }
    ctx.fillStyle = backgroundColor
    ctx.fill()
  } else {
    if (borderColor) {
      ctx.strokeStyle = borderColor
      ctx.strokeRect(x, y, width, height)
    }
    ctx.fillStyle = backgroundColor
    ctx.fillRect(x, y, width, height)
  }
}

/**
 * 绘制圆角路径
 */
function drawBorderRadius(ctx, elem) {
  const { x = 0, y = 0, width = 0, height = 0, borderRadius = 0 } = elem
  ctx.beginPath()
  ctx.moveTo(x + borderRadius, y)
  ctx.lineTo(x + width - borderRadius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + borderRadius)
  ctx.lineTo(x + width, y + height - borderRadius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - borderRadius, y + height)
  ctx.lineTo(x + borderRadius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - borderRadius)
  ctx.lineTo(x, y + borderRadius)
  ctx.quadraticCurveTo(x, y, x + borderRadius, y)
  ctx.closePath()
}

/**
 * 绘制圆角路径Only
 */
function drawBorderRadiusOnly(ctx, elem) {
  const {
    x = 0,
    y = 0,
    width = 0,
    height = 0,
    borderRadiusTRBL = {
      t: 0,
      r: 0,
      b: 0,
      l: 0,
    },
  } = elem
  ctx.beginPath()
  ctx.moveTo(x + borderRadiusTRBL.t, y)
  ctx.lineTo(x + width - borderRadiusTRBL.r, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + borderRadiusTRBL.r)
  ctx.lineTo(x + width, y + height - borderRadiusTRBL.b)
  ctx.quadraticCurveTo(x + width, y + height, x + width - borderRadiusTRBL.b, y + height)
  ctx.lineTo(x + borderRadiusTRBL.l, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - borderRadiusTRBL.l)
  ctx.lineTo(x, y + borderRadiusTRBL.t)
  ctx.quadraticCurveTo(x, y, x + borderRadiusTRBL.t, y)
  ctx.closePath()
}
