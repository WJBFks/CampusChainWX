// pages/secondhand/index/index.js
const db = wx.cloud.database()
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loading: 0,
    sells: [],
  },

  onShow: function () {
    this.refresh();
  },

  onPullDownRefresh: function () {
    console.log("刷新");
    this.refresh();
  },

  sellBtn() {
    wx.navigateTo({
      url: "/pages/secondhand/sell/sell"
    })
  },

  refresh() {
    db.collection('secondhand').get()
      .then(res => {
        let p = []
        for (let i = 0; i < res.data.length; i++) {
          p.push(app.User(res.data[i]._openid).getField().name().then(r => {
            res.data[i]['sellerName'] = r.userinfo.nickName
          }))
        }
        Promise.all(p).then(r => {
          this.setData({
            sells: res.data,
            loading: 1,
          })
        }, err => {
          this.setData({
            loading: -1,
          })
          console.log(err);
        })
      })
  },

  selectItem(e) {
    console.log(e.currentTarget.id);
    wx.navigateTo({
      url: "/pages/secondhand/item/item?id=" + e.currentTarget.id,
    })
  }
})