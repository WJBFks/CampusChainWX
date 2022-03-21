// pages/mine/index/index.js
const app = getApp()
const db = wx.cloud.database();
const cloud = wx.cloud
wx.cloud.init()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    navBarHeight: app.globalData.navBarHeight,
    menuRight: app.globalData.menuRight,
    menuBotton: app.globalData.menuBotton,
    menuHeight: app.globalData.menuHeight,
    navDis: app.globalData.navDis,
    navTop: app.globalData.navTop,

    str: null,
    loginStatus: 'loading',
    user: {
      userinfo: {
        avatarUrl: "/images/test.png",
        nickName: "未登录用户"
      }
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  test() {
    app.Request('/test').POST({
      test: {
        name: '123',
        str: 'hello wolrd'
      },
    }).then(res => {
      this.setData({
        str: res.data.str
      })
      console.log(res);
    }).catch(err => {
      console.log(err);
    })
  },

  onLoad: function (options) {
    // this.test()
    // cloud.callFunction({
    //   name: 'request',
    //   data: {
    //     url: 'http://60.205.176.207:9000'
    //   }
    // }).then(res => {
    //   console.log(res);
    // }, err => {
    //   console.log(err);
    // })


    this.setData({
      loginStatus: 'register'
    })
    app.User().get().then(res => {
      return this.login()
    }, err => {
      console.log('未注册用户');
    })
  },

  login() {
    return new Promise((resolve, reject) => {
      app.User().get()
        .then(res => {
          this.setData({
            user: res,
            loginStatus: 'login'
          })
          resolve('登录成功')
        })
        .catch(err => {
          this.setData({
            loginStatus: 'register'
          })
          reject(err)
        })
    })
  },

  getUserProfile(e) {
    var that = this;
    wx.getUserProfile({
        desc: '用于登录', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      })
      .then(res => {
        return app.User().addup({
          userinfo: res.userInfo
        })
      })
      .then(res => {
        console.log(res);
        that.login()
      })
      .catch(err => {
        console.log(err);
      })
  },

  toIdentity() {
    wx.reLaunch({
      url: "/pages/identity/index/index?tab=1"
    })
  }
})