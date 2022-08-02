/*
 * @Author: chinbor.Mn
 * @Date: 2022-06-13 12:31:41
 * @LastEditTime: 2022-07-07 22:38:24
 * @LastEditors: chinbor.Mn
 * @Description: 这个文件一般是自建埋点系统，例如在页面拦截器做了页面的pv埋点
 * @FilePath: \ronggui-mini\framework\tracker\index.js
 */
// import storage from '../../utils/storage'

export default {
  _getPageUrl(page) {
    return page ? page.route || page.__route__ || '' : ''
  },

  // FIXME: 后续修改这里为完整的全局页面埋点（一般是页面的pv）
  page(page_event = 'p_page', session_start, session_end) {
    // const pages = this.$pages
    // const length = pages.length
    // const page = pages[length - 1]
    // const url = this._getPageUrl(page)
    // const refer_url = length > 1 ? this._getPageUrl(pages[length - 2]) : ''
    // 上报接口
    // trackEvent(
    //   page_event,
    //   this._getBasicData({
    //     project_id, // 项目ID
    //     session_start, // session开始时间
    //     session_end, // session结束时间
    //     nick_name, // 用户昵称
    //     phone_num, // 用户手机号码
    //     seller_id: from_seller_id, // 分享链接的顾问ID
    //     seller_name: from_seller_name, // 分享链接的顾问名字
    //     url, // 本页面的链接地址
    //     refer_url, // 上个页面的链接地址
    //   }),
    // )
  },

  _getBasicData(data) {
    // const userInfo = storage.get(USER_INFO, {})
    // const area = storage.get(CURR_AREA, {})
    // return {
    //   role: userInfo.seller_title || '',
    //   // phone_num: userInfo.phone_num || '',
    //   user_id: userInfo.user_id,
    //   open_id: userInfo.open_id,
    //   area_name: area.area_name || '全国',
    //   client_version: version,
    //   ...data,
    // }
  },
}
