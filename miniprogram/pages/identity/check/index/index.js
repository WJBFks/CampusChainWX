// pages/identity/check/index/index.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    users: null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onShow: function (options) {
    app.User().gets().identity().then(res => {
      this.setData({
        users: res
      })
      this.userSort()
    })
  },

  onPullDownRefresh: function (options) {
    this.onShow()
  },

  userSort() {
    let users = this.data.users
    users.sort(function (a, b) {
      const Map = (e) => {
        if (e.identity == null) {
          return 0
        }
        switch (e.identity.status) {
          case '审核中':
            return 5;
          case '驳回':
            return 4;
          case '通过':
            return 3;
          default:
            return 0;
        }
      }
      return Map(b) - Map(a)
    });
    this.setData({
      users
    })
  },

  btn(e) {
    console.log(e);
    let id = e.currentTarget.id
    let users = this.data.users
    let pre = users[id].identity.status
    let t = e.currentTarget.dataset.t
    users[id].identity.status = t
    this.setData({
      users
    })
    this.userSort()
    app.User().addup({
      openid: users[id]._id,
      identity: users[id].identity,
    }).then(res => {}, err => {
      users[id].identity.status = pre
      this.setData({
        users
      })
      this.userSort()
    })
  },

  toItem(e) {
    let id = e.currentTarget.id
    wx.navigateTo({
      url: '/pages/identity/check/item/item?id=' + id + '&authority=100',
    })
  }
})