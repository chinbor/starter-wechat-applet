// components/page/index.js
import { rpxToPx } from '../../utils/helpers'
import router from '../../router/index'

const menuButton = wx.memory.get('menuButton')
const isIphoneX = wx.memory.get('isIphoneX')
const winWidth = wx.memory.get('windowWidth')
const screenHeight = wx.memory.get('screenHeight')
const safeArea = wx.memory.get('safeArea')

Component({
  options: {
    addGlobalClass: true, // 应用全局app.wxss中的样式
    multipleSlots: true, // 在组件定义时的选项中启用多slot支持
  },
  // 组件的生命周期
  lifetimes: {
    ready() {
      // 动态计算footer的高度
      if (this.data.hasFooter) {
        const query = this.createSelectorQuery()
        query.select('.custom-page__footer').boundingClientRect()
        query.exec(res => {
          this.setData({
            // 这里硬性加了14rpx是因为在非tab页面安全区计算公式screenHeight - safeArea.bottom偏大导致body部分padding-bottom偏小，当存在footer的时候容易遮挡！！
            // 所以硬性padding-bottom增加14rpx，让footer部分不会遮挡body页面
            footerHeight: isIphoneX && !this.properties.isTab ? res[0].height - (screenHeight - safeArea.bottom) + rpxToPx(14) : res[0].height,
          })
        })
      }
    },
  },
  // 组件所在页面的生命周期
  pageLifetimes: {
    // 页面被展示
    show() {
      if (this.data.hasCanvas && !this.data.showCanvas) {
        this.setData({ showCanvas: true })
      }
    },
    // 页面被隐藏
    hide() {
      if (this.data.hasCanvas) {
        this.setData({ showCanvas: false })
      }
    },
  },
  /**
   * 组件的属性列表
   */
  properties: {
    // 页面标题
    title: { type: String, value: '' },
    // 是否tab页面
    isTab: { type: Boolean, value: false },
    // 是否有头部
    hasHeader: { type: Boolean, value: true },
    // 是否有底部
    hasFooter: { type: Boolean, value: false },
    // 是否加载用于分享海报的canvas
    hasCanvas: { type: Boolean, value: false },
    // NOTE: 是否自定义header，hasHeader一定设置为true!!!
    customHeader: { type: Boolean, value: false },
    // NOTE: 是否展示返回按钮，hasHeader一定设置为true!!!
    showBack: { type: Boolean, value: false },
    // NOTE: 是否展示home按钮，hasHeader一定设置为true!!!
    showHome: { type: Boolean, value: false },
    // 头部的背景颜色
    headerBgColor: { type: String, value: 'transparent' },
    // 头部的文字颜色
    headerTitleColor: { type: String, value: '#fff' },
    // 白色的按钮还是黑色
    whiteCapluse: { type: Boolean, value: true },
  },

  /**
   * 组件的初始数据
   */
  data: {
    // 胶囊按钮底部再往下16px
    headerHeight: menuButton.bottom + rpxToPx(16),
    isIphoneX,
    footerHeight: 0,
    navPosition: `
      top: ${menuButton.top}px;
      height: ${menuButton.height}px;
      line-height: ${menuButton.height}px;
    `,
    capsulePosition: `
      left: ${winWidth - menuButton.right}px;
    `,
    capsule1btnStyle: `
      height: ${menuButton.height}px;
      width: ${menuButton.width / 2}px;
    `,
    capsule2btnsStyle: `
      height: ${menuButton.height}px;
      width: ${menuButton.width}px;
      border-radius: ${menuButton.height / 2}px;
    `,
    titleStyle: `
      left: ${winWidth - menuButton.right + menuButton.width}px;
      height: ${menuButton.height}px;
      line-height: ${menuButton.height}px;
      width: ${(menuButton.right - menuButton.width) * 2 - winWidth}px;
    `,
    showCanvas: true,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    goBack() {
      router.goBack()
    },
    goHome() {
      router.switchTab('home')
    },
  },
})
