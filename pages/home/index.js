// pages/home/index.js

const menuButton = wx.memory.get('menuButton')
const winWidth = wx.memory.get('windowWidth')

Page({
  /**
   * 页面的初始数据
   */
  data: {
    serchPosition: `
      height: ${menuButton.height}px;
      top: ${menuButton.top}px;
      left: ${winWidth - menuButton.right}px;
    `,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {},

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {},

  // 说白了就是一个倒计时的作用，为了保持去到其他页面当前页面也进行计时
  tick(delta) {},
})
