import { isObject } from './helpers'

/**
 * 组装请求URL参数
 */
export function assemble(url, obj) {
  const str = objToString(obj)
  if (str === '') {
    return url
  }
  if (url.indexOf('?') > -1) {
    url = url.concat('&').concat(str)
  } else {
    url = url.concat('?').concat(str)
  }
  return url
}

export function https(url) {
  return url.replace(/^http:/, 'https:')
}

/**
 * 将对象转化为参数字符串
 */
export function objToString(obj, encode = true, join = '&') {
  const arr = []

  Object.keys(obj).forEach(key => {
    const val = isObject(obj[key]) ? JSON.stringify(obj[key]) : obj[key]

    if (encode) {
      arr.push(encodeURIComponent(key) + '=' + encodeURIComponent(val))
    } else {
      arr.push(key + '=' + val)
    }
  })

  return arr.join(join)
}

/**
 * convert url's search to object
 * @param {string} params params like: `key1=value1&key2=value2`
 * @returns convert params to object like: `{ key1: 'value1', key2: 'value2' }`
 */
export function stringToObj(params) {
  const result = {}
  const reg = /([^&=]+)=([\w\W]*?)(&|$)/g

  if (params) {
    let match

    while ((match = reg.exec(params)) !== null) {
      result[decodeURIComponent(match[1])] = decodeURIComponent(match[2])
    }
  }

  return result
}

/**
 * 获取url上的参数
 */
export function getUrlQuery(url, name) {
  const reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)')
  const param = url.split('?')[1]
  if (param) {
    const r = url.split('?')[1].match(reg)
    if (r !== null) {
      return unescape(r[2])
    }
  }
  return ''
}
