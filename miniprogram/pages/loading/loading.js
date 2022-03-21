// pages/loading/loading.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    timeout: ''
  },

  onShow(){
    if(app.globalData.loadDone){
      wx.reLaunch({
        url: "/pages/mine/index/index"
      })
    }
  },

  onLoad() {
    setTimeout(() => {
      this.setData({
          timeout: '正在加载，请稍等'
        })
    }, 1000)
    setTimeout(() => {
      this.setData({
        timeout: '加载较为缓慢，请稍等'
      })
    }, 2000)
    setTimeout(() => {
      this.setData({
          timeout: '网络可能不佳，可以尝试重新启动小程序'
        })
    }, 5000)
    setTimeout(() => {
      this.setData({
          timeout: '建议您重新启动小程序'
        })
    }, 10000)
  }
})