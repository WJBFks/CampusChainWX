// pages/secondhand/index/index.js
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
    sells_left: [],
    sells_right: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

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

  sellBtn() {
    wx.navigateTo({
      url: "/pages/secondhand/sell/sell"
    })
  },

  refresh() {
    var that = this;
    that.setData({
      openid: app.globalData.openid
    })
    db.collection('secondhand').get().then(res => {
        return res.data
      })
      .then(res => {
        let promiseArr = [];
        for (let i = 0; i < res.length; i++) {
          promiseArr.push(
            db.collection('users').doc(res[i]._openid).get().then(seller => {
              res[i].seller = seller.data;
            }).then(res2 => {
              return wx.getImageInfo({
                src: res[i].image[0]
              }).then(res3 => {
                res[i].rate = res3.height / res3.width * 360 + 226
              }).then(() => {
                if (res[i]._openid == that.data.openid) {
                  res[i].state = 2;
                } else {
                  let isExist = res[i].buyers.find(function (value) {
                    return value == that.data.openid
                  })
                  if (isExist) {
                    res[i].state = 1;
                  } else {
                    res[i].state = 0;
                  }
                }
              })
            })
          );
        }
        return Promise.all(promiseArr).then(() => {
          let left = 0;
          let right = 0;
          let sells_left = [];
          let sells_right = [];
          for (let i = 0; i < res.length; i++) {
            if (left <= right) {
              sells_left.push(res[i]);
              left += res[i].rate;
            } else {
              sells_right.push(res[i]);
              right += res[i].rate;
            }
            // console.log(i + ":" + left + " " + right);
          }
          that.setData({
            sells_left: sells_left,
            sells_right: sells_right
          })
          that.setData({
            loading: 1
          })
          console.log("交易列表加载完成");
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
      url: "/pages/secondhand/item/item?id=" + e.currentTarget.id,
    })
  }
})