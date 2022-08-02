/*
 * @Author: chinbor.Mn
 * @Date: 2022-07-07 22:05:16
 * @LastEditTime: 2022-08-02 14:51:33
 * @LastEditors: chinbor.Mn
 * @Description: 神策的埋点系统
 * @FilePath: \three-kingdoms\framework\tracker\shence.js
 */
import auth from '../../modules/auth'
import { trackHost } from '../../common/config/api'
const sensors = require('../../sdk/sensorsdata.min')

const eventName = {
  error: '$ERROR',
  action: '$ACTION',
}

const keyName = {
  networkErr: '$network_err',
  scriptOrApiUseErr: '$script_apiuse_err',
  pageNotFoundErr: '$page_not_found_err',
  unhandledRejectionErr: '$unhandled_rejection_err',
}

function _trackOnlyOneKv(name, key, val) {
  // NOTE: if you want to use, you need config trackUrl
  // sensors.track(name, {
  //   [key]: val,
  // })
}

export function shenceInit() {
  // 配置
  sensors.setPara({
    name: 'sensors',
    server_url: trackHost,
    // 全埋点控制开关
    autoTrack: {
      appLaunch: true, // 默认为 true，false 则关闭 $MPLaunch 事件采集
      appShow: true, // 默认为 true，false 则关闭 $MPShow 事件采集
      appHide: true, // 默认为 true，false 则关闭 $MPHide 事件采集
      pageShow: true, // 默认为 true，false 则关闭 $MPViewScreen 事件采集
      pageShare: true, // 默认为 true，false 则关闭 $MPShare 事件采集
      mpClick: false, // 默认为 false，true 则开启 $MPClick 事件采集
      mpFavorite: false, // 默认为 true，false 则关闭 $MPAddFavorites 事件采集
      pageLeave: true, // 默认为 false， true 则开启 $MPPageLeave事件采集
    },
    // 自定义渠道追踪参数，如 source_channel: ["custom_param"]
    source_channel: [],
    // 是否允许控制台打印查看埋点数据(建议开启查看)
    show_log: true,
    // 是否允许修改 onShareAppMessage 里 return 的 path，用来增加(登录 ID，分享层级，当前的 path)，在 app onShow 中自动获取这些参数来查看具体分享来源、层级等
    allow_amend_share_path: true,
  })

  auth
    .promise()
    .then(res => {
      const id = res && res.userBase && res.userBase.userBaseId

      // 设置自己的用户id作为唯一标识进行上报
      id && sensors.setOpenid(id)
    })
    .finally(() => {
      // 初始化
      sensors.init()
    })
}

export const track = {
  error: {
    networkErr: val => {
      _trackOnlyOneKv(eventName.error, keyName.networkErr, val)
    },
    scriptOrApiUseErr: val => {
      _trackOnlyOneKv(eventName.error, keyName.scriptOrApiUseErr, val)
    },
    pageNotFoundErr: val => {
      _trackOnlyOneKv(eventName.error, keyName.pageNotFoundErr, val)
    },
    unhandledRejectionErr: val => {
      _trackOnlyOneKv(eventName.error, keyName.unhandledRejectionErr, val)
    },
  },
}
