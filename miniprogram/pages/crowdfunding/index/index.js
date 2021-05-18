// pages/crowdfunding/index/index.js
const db = wx.cloud.database()
const query = wx.createSelectorQuery();
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    openid: app.globalData.openid,
    loading: 0, //0:加载中 -1:加载失败 1:加载成功
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.refresh();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    console.log("刷新");
    this.refresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  Btn(e) {
    wx.navigateTo({
      url: "/pages/crowdfunding/apply/apply"
    })
  },

  refresh() {
    var that = this;
    that.setData({
      openid: app.globalData.openid
    })
    db.collection('crowdfunding').get().then(res => {
        return res.data
      })
      .then(res => {
        let promiseArr = [];
        for (let i = 0; i < res.length; i++) {
          promiseArr.push(
            db.collection('users').doc(res[i]._openid).get().then(applicant => {
              res[i].applicant = applicant.data;
            })
          );
        }
        return Promise.all(promiseArr).then(() => {
          that.setData({
            applications: res
          })
          that.setData({
            loading: 1
          })
          console.log("申请列表加载完成");
          wx.stopPullDownRefresh() //刷新完成后停止下拉刷新动效
        })
      })
      .catch(err => {
        that.setData({
          loading: -1
        })
        console.log("物品列表加载失败");
        console.log(err);
      })
  },

  selectItem(e) {
    console.log(e.currentTarget.id);
    wx.navigateTo({
      url: "/pages/crowdfunding/item/item?id=" + e.currentTarget.id,
    })
  },
})