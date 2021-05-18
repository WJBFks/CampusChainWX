import WxValidate from '../../../assets/plugins/wx-validate/WxValidate'
// pages/login/index/index.js
const db = wx.cloud.database();
var userInfo = {};
var openID;
var schools = ["计算机科学与工程学院"]
Page({

  /**
   * 页面的初始数据
   */
  data: {
    index: null,
    picker: schools,
    openID: "",
    state: 0
    //0：加载中
    //91:获取openID失败
    //1: 获取微信信息
    //2: 注册详细信息
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.initValidate()
    wx.getStorage({
        key: 'openID',
      })
      .then(res => {
        console.log("openID读取缓存成功");
        openID = res.data;
      }, err => {
        console.log("openID读取缓存失败");
        return new Promise((resolve, reject) => {
          wx.cloud.callFunction({
              name: 'login',
            })
            .then(res => {
              console.log("通过云函数获取openID成功");
              openID = res.result.openid;
              wx.setStorage({
                  key: 'openID',
                  data: openID,
                })
                .then(res => {
                  console.log("openID缓存成功")
                  resolve("openID缓存成功")
                })
                .catch(err => {
                  console.log("openID缓存失败");
                  reject("openID缓存失败")
                })
            }, err => {
              console.log("通过云函数获取openID失败");
              reject("通过云函数获取openID失败")
            })
        })
      })
      .then(res => {
        return db.collection('users').doc(openID).get()
      })
      .then(res => {
        return wx.reLaunch({
          url: '/pages/mine/index/index?id=' + openID
        })
      })
      .catch(err => {
        console.log("登录失败");
        console.log(err);
        if (this.data.state == 0) {
          this.login();
        }
      })
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

  PickerChange(e) {
    console.log(e);
    this.setData({
      index: e.detail.value
    })
  },

  submitForm(e) {
    const params = e.detail.value

    // 传入表单数据，调用验证方法
    if (!this.WxValidate.checkForm(params)) {
      const error = this.WxValidate.errorList[0]
      this.showModal(error)
      return false
    } else {
      this.showModal({
        msg: '提交成功',
      })
      params.school = schools[params.school];
      db.collection('users').add({
          data: {
            _id: openID,
            userInfo: userInfo,
            moreInfo: params
          }
        })
        .then(res => {}, err => {
          if (err.errCode) {
            return db.collection('users').doc(openID).update({
              data: {
                userInfo: userInfo,
                moreInfo: params
              }
            })
          } else {
            throw "数据库数据添加错误"
          }
        })
        .then(res => {
          return wx.reLaunch({
            url: '/pages/mine/index/index?id=' + openID
          })
        })
    }
  },

  getUserProfile(e) {
    var that = this;
    openID = that.data.openID;
    wx.getUserProfile({
        desc: '用于登录', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      })
      .then(res => {
        userInfo = res.userInfo;
        that.setData({
          state: 2
        })
      })
      .catch(err => {
        that.setData({
          state: 91
        })
        console.log(err);
      })
  },

  login() {
    let that = this;
    that.setData({
      state: 0
    })
    wx.cloud.callFunction({
        name: 'login',
      })
      .then(res => {
        return wx.setStorage({
          key: "openID",
          data: res.result.openid
        })
      })
      .then(res => {
        return wx.getStorage({
          key: 'openID'
        })
      })
      .then(res => {
        this.setData({
          openID: res.data,
          state: 1
        })
      })
      .catch(err => {
        that.setData({
          state: 91
        })
        console.log(err);
      })
  },

  initValidate() {
    const rules = {
      realName: {
        required: true
      },
      number: {
        required: true,
        rangelength: [8, 8]
      },
      school: {
        required: true
      },
      phone: {
        required: true,
        tel: true
      },
    }

    const messages = {
      realName: {
        required: '请输入真实姓名'
      },
      number: {
        required: '请输入学号',
        rangelength: '请输入八位学号'
      },
      school: {
        required: '请选择学院',
      },
      phone: {
        required: '请输入手机号',
        tel: '请输入正确的11位手机号'
      }
    }

    this.WxValidate = new WxValidate(rules, messages)
  },

  showModal(error) {
    wx.showModal({
      content: error.msg,
      showCancel: false,
    })
  },
})