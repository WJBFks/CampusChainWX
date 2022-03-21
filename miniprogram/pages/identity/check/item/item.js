// pages/identity/check/item/item.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: null,
    au: null,
    user: null,
    authority: '',
    identity: '',
  },

  onLoad: function (options) {
    let id = options.id
    let au = options.authority
    this.setData({
      id,
      au
    })
    this.getUser(id).then(res => {
      this.getIdentity()
    })
  },

  getUser(id) {
    return app.User().get(id).then(res => {
      this.setData({
        user: res
      })
      return
    })
  },

  getIdentity() {
    let authority = this.data.authority
    if (authority == '') {
      authority = this.data.user.identity.authority
    } else {
      authority = Number(authority)
    }
    this.setData({
      identity: app.getIdentity(authority)
    })
  },

  authorityChange(e) {
    let authority = e.detail.value
    if (authority != '') {
      authority = Number(authority)
      if (!isNaN(authority)) {
        if (authority < 0) {
          authority = 0
        }
        if (authority >= this.data.au) {
          authority = this.data.au - 1
        }
      } else {
        authority = ''
      }
    }
    this.setData({
      authority
    })
    this.getIdentity()
  },

  saveIdentiy(e) {
    let t = e.currentTarget.dataset.t
    let identity = this.data.user.identity
    let authority;
    let s;
    if (t == '通过') {
      s = '通过'
      authority = this.data.authority
      if (authority == '') {
        authority = identity.authority
      }
    } else if (t == '驳回') {
      s = '驳回'
      authority = identity.authority
    }
    identity.authority = authority
    identity.status = s
    wx.showLoading({
      title: '正在' + t,
      mask: true,
    })
    app.User(this.data.id).addup({
      identity
    }).then(res => {
      wx.showToast({
        title: t + '成功',
        icon: 'success',
        duration: 1000,
        mask: true,
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 1000)
    }, err => {
      wx.showToast({
        title: t + '失败',
        icon: 'error',
        duration: 1000
      })
    })
  },

})