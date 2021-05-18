const db = wx.cloud.database()
const query = wx.createSelectorQuery();
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    openid: app.globalData.openid,
    data: [],
    openid: "",
    state: -1, //0：资助者 1：申请者
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    that.setData({
      openid: app.globalData.openid
    })
    if (options.id) {
      new Promise((resolve, reject) => {
        db.collection('crowdfunding').doc(options.id).get()
          .then(res => {
            return db.collection('users').doc(res.data._openid).get().then(applicant => {
              res.data.applicant = applicant.data;
              return res
            })
          })
          .then(res => {
            if (res.data._openid == that.data.openid) {
              that.setData({
                state: 1,
              }, () => {
                console.log('申请者');
                resolve();
              })
            } else {
              that.setData({
                state: 0,
              }, () => {
                console.log('资助者');
                resolve();
              })
            }
            that.setData({
              data: res.data,
            }, () => {
              console.log('物品信息加载成功');
              resolve();
            })
          })
      })
    } else {
      console.log('加载出错，没有传入ID');
    }
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

  preview(event) {
    if (this.data.data.image) {
      let that = this;
      let id = event.target.id;
      wx.previewImage({
        current: that.data.data.image[id], // 当前显示图片的http链接
        urls: that.data.data.image // 需要预览的图片http链接列表
      })
    }
  },

  buyBtn(e) {
    let that = this;
    wx.showModal({
      title: "购买确认",
      content: "你确定要购买该物品吗？"
    }).then(res => {
      if (res.confirm) {
        let buyers = that.data.data.buyers.concat(that.data.openid);
        console.log(buyers);
        db.collection('secondhand').doc(that.data.data._id).update({
            data: {
              buyers: buyers
            }
          })
          .then(res => {
            that.setData({
              state: 1
            })
            console.log('购买成功');
          }, err => {
            console.log(err);
          })
      } else if (res.cancel) {

      } else {
        console.log('购买确认出现错误');
        console.log(res);
      }
    }, err => {
      console.log('购买确认出现错误');
      console.log(err);
    })
  },

  deleteBtn(e) {
    let that = this;
    wx.showModal({
      title: "删除物品",
      content: "确定删除该物品寄售信息吗？"
    }).then(res => {
      if (res.confirm) {
        db.collection('secondhand').doc(that.data.data._id).remove()
          .then(res => {
            wx.navigateBack({
              delta: 1
            })
            console.log('物品信息删除成功');
          }, err => {
            console.log(err);
          })
      } else if (res.cancel) {
        console.log('取消删除物品');
      } else {
        console.log('购买确认出现错误');
        console.log(res);
      }
    }, err => {
      console.log('购买确认出现错误');
      console.log(err);
    })
  },

  cancelBtn(e) {
    let that = this;
    wx.showModal({
      title: "取消购买",
      content: "你确定要取消购买吗？"
    }).then(res => {
      if (res.confirm) {
        let buyers = that.data.data.buyers;
        buyers.some((item, i) => {
          if (item == that.data.openid) {
            buyers.splice(i, 1);
            return true
          }
        })
        db.collection('secondhand').doc(that.data.data._id).update({
            data: {
              buyers: buyers
            }
          })
          .then(res => {
            that.setData({
              state: 0
            })
            console.log('取消成功');
          }, err => {
            console.log(err);
          })
      } else if (res.cancel) {

      } else {
        console.log('取消购买出现错误');
        console.log(res);
      }
    }, err => {
      console.log('取消购买出现错误');
      console.log(err);
    })
  }
})