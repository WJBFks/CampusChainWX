// pages/gathering/index/index.js
const app = getApp()
const cloud = wx.cloud
wx.cloud.init()

Page({

  data: {
    gatherings: [],
    userInfo: []
  },

  onShow: function (options) {
    this.getGatherings()
      .then(res => {
        this.getUserInfo()
      })
  },

  onPullDownRefresh: function (options) {
    this.onShow();
  },

  getGatherings() {
    let that = this;
    return new Promise((resolve, reject) => {
      app.Request('/gathering/list').POST({
          mode: 0
        })
        .then(res => {
          console.log(res);
          let d = JSON.parse('[' + res.data + ']')
          console.log(d);
          that.setData({
            gatherings: d
          })
          resolve(res)
        }, err => {
          reject(err)
        })
    })
  },

  getUserInfo() {
    let p = []
    let userInfo = new Array(this.data.gatherings.length)
    for (let i = 0; i < this.data.gatherings.length; i++) {
      p.push(cloud.callFunction({
        name: 'userDB',
        data: {
          operate: 'get',
          openid: this.data.gatherings[i].creator
        }
      }).then(res => {
        userInfo[i] = res.result.userinfo
      }).catch(err => {
        console.log(err);
      }))
    }
    return new Promise((resolve, reject) => {
      Promise.all(p).then(() => {
        this.setData({
          userInfo
        })
        console.log(userInfo);
        resolve()
      }, err => {
        reject(err)
      })
    })
  },

  selectItem(e) {
    let id = e.currentTarget.dataset.id
    console.log(id);
    wx.navigateTo({
      url: "/pages/gathering/item/item?id=" + id,
    })
  },

  toInitiate() {
    wx.navigateTo({
      url: "/pages/gathering/initiate/initiate",
    })
  }
})