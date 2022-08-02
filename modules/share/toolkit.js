export function splitLines(str, length, num) {
  if (!str) {
    return ''
  }

  let lines = [str.slice(0, length)]
  let leftStr = str.slice(length)

  while (leftStr.length > length) {
    const line = leftStr.slice(0, length)

    leftStr = leftStr.slice(length)
    lines.push(line)
  }

  leftStr.length && lines.push(leftStr)

  if (num && lines.length > num) {
    lines = lines.slice(0, num)
    const lastLine = lines[num - 1]
    const newLastList = lastLine.slice(0, lastLine.length - 1) + '...'
    lines[num - 1] = newLastList
  }

  return lines.join('\n')
}

export function getTextWidth(str, charWidth) {
  let len = 0
  const length = str.length

  for (let x = 0; x < length; x++) {
    if (str.charCodeAt(x) > 128) {
      len += 2
    } else {
      len += 1
    }
  }

  return len * charWidth
}

/**
 * 根据路径和场景拼接小程序二维码的请求路径
 * @param {string} path 分享的页面路径
 * @param {string} scene 分享的页面参数
 * @param {number} width 二维码大小，默认280
 */
export function makeQrcode(path = 'pages/index/index', scene = {}, width = 280) {
  // FIXME: 替换为线上接口地址
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        data: 'erweima地址',
      })
    }, 500)
  })
}
