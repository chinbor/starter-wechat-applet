const fs = require('fs')
const { host, the3rdHosts, aliOssHost, trackHost } = require('../package.json').wx.env
const apiConfigPath = process.cwd() + '/common/config/api.js'
const env = process.argv[2]
const the3rdApiPrefixObj = {}

const configForApi = `/* eslint-disable  */
// 这个文件不要动，因为涉及到环境问题
export const apiPrefix = '#API_PREFIX#'
export const aliOssHost = '#ALI_OSS_HOST#'
export const the3rdApiPrefixObj = '#3RD_API_PREFIX#'
export const trackHost = '#TRACK_HOST#'
`
fs.writeFileSync(apiConfigPath, configForApi)

Object.keys(the3rdHosts).forEach(key => {
  the3rdApiPrefixObj[key] = the3rdHosts[key][env]
})

const data = fs.readFileSync(apiConfigPath)

let content = data.toString()

const replaceMap = {
  ['#API_PREFIX#']: host[env],
  // NOTE: 注意这里，由于我们需要替换的是一个对象 string 化，所以需要将模板中的 '#3RD_API_PREFIX#' 整体替换！！
  ["'#3RD_API_PREFIX#'"]: the3rdApiPrefixObj,
  ['#ALI_OSS_HOST#']: aliOssHost,
  ['#TRACK_HOST#']: trackHost[env],
}

Object.keys(replaceMap).forEach(key => {
  content = content.replace(key, typeof replaceMap[key] === 'string' ? replaceMap[key] : JSON.stringify(replaceMap[key]))
})

fs.writeFileSync(apiConfigPath, content)
