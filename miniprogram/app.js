import components from './helpers/components'
const cloud = wx.cloud
wx.cloud.init()
const db = wx.cloud.database();
var user;
var userGetTimeStamp = null;
var userUpdateTimeStamp = null;

// const id = 'on8O65OUTCWDHyuvmpI7TBaUtIXw'
// const lunchTo = '/pages/gathering/fill/fill?id=gat-1646706645256'
// const lunchTo = '/pages/gathering/initiate/initiate'
// const lunchTo = "/pages/gathering/initiate/initiate"
const lunchTo = "/pages/mine/index/index"

App({
  components,
  globalData: {
    //导航栏信息
    navBarHeight: 0, // 导航栏高度
    menuRight: 0, // 胶囊距右方间距（方保持左、右间距一致）
    menuBotton: 0, // 胶囊距底部间距（保持底部间距一致）
    menuHeight: 0, // 胶囊高度（自定义内容可与胶囊高度保证一致）
    navDis: 0,
    navTop: 0,
    openid: "",
    loadDone: false,
  },

  onLaunch: function () {
    this.calcNav()
    wx.cloud.callFunction({
        name: 'login',
      })
      .then(res => {
        this.globalData.openid = res.result.openid;
        return this.User().get()
      })
      .then(res => {}, err => {})
      .then(res => {
        this.globalData.loadDone = true;
        wx.reLaunch({
          url: lunchTo
        })
      })
  },

  calcNav() {
    // 获取导航栏信息
    // 获取系统信息
    const systemInfo = wx.getSystemInfoSync();
    // 胶囊按钮位置信息
    const menuButtonInfo = wx.getMenuButtonBoundingClientRect();
    //
    this.globalData.navTop = systemInfo.statusBarHeight;
    // 导航栏间距 = （胶囊距上距离-状态栏高度）
    this.globalData.navDis = (menuButtonInfo.top - systemInfo.statusBarHeight);
    // 导航栏高度 = 导航栏间距 * 2 + 胶囊高度 + 状态栏高度
    this.globalData.navBarHeight = this.globalData.navDis * 2 + menuButtonInfo.height + systemInfo.statusBarHeight;
    this.globalData.menuRight = systemInfo.screenWidth - menuButtonInfo.right;
    this.globalData.menuBotton = menuButtonInfo.top - systemInfo.statusBarHeight;
    this.globalData.menuHeight = menuButtonInfo.height;
  },

  getIdentity(a) {
    if (a == 100) {
      return '最高管理员'
    } else if (a >= 80) {
      return '高级管理员' + (a == 80 ? '' : a - 80)
    } else if (a >= 60) {
      return '大学负责人' + (a == 60 ? '' : a - 60)
    } else if (a >= 40) {
      return '学院负责人' + (a == 40 ? '' : a - 40)
    } else if (a >= 30) {
      return '年级负责人' + (a == 30 ? '' : a - 30)
    } else if (a >= 20) {
      return '专业负责人' + (a == 20 ? '' : a - 20)
    } else if (a >= 10) {
      return '班级负责人' + (a == 10 ? '' : a - 10)
    } else {
      return '学生' + (a == 0 ? '' : a)
    }
  },

  getTimeStamp(ts) {
    let date;
    if (ts) {
      date = new Date(ts)
    } else {
      date = new Date()
    }
    let timestamp = date.getTime()
    return {
      timestamp,
      date() {
        var Y = date.getFullYear();
        var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
        var D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
        return Y + '-' + M + '-' + D
      },
      time(ss) {
        var h = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
        var m = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
        var s = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
        if(ss){
          return h + ':' + m + ':' + s
        }else{
          return h + ':' + m
        }
      },
      full() {
        return this.date() + ' ' + this.time();
      }
    }
  },

  User(id) {
    var that = this;
    return {
      get(openid) {
        if (openid == null) {
          openid = id
        }
        return new Promise((resolve, reject) => {
          if (openid == null && userGetTimeStamp != null && (
              userUpdateTimeStamp == null ||
              userGetTimeStamp > userUpdateTimeStamp)) {
            userGetTimeStamp = that.getTimeStamp();
            resolve(user);
          } else {
            cloud.callFunction({
              name: 'userDB',
              data: {
                operate: 'get',
                openid
              }
            }).then(res => {
              if (openid == null) {
                user = res.result
                userGetTimeStamp = that.getTimeStamp();
              }
              resolve(res.result)
            }).catch(err => {
              reject(err)
            })
          }
        })
      },
      addup({
        openid,
        userinfo,
        identity,
      }) {
        if (openid == null) {
          openid = id
        }
        return new Promise((resolve, reject) => {
          cloud.callFunction({
            name: 'userDB',
            data: {
              operate: 'add/update',
              openid,
              userinfo,
              identity,
            }
          }).then(res => {
            if (openid == null) {
              userUpdateTimeStamp = that.getTimeStamp();
            }
            resolve({
              meg: '添加/更新成功',
              res
            })
          }).catch(err => {
            reject({
              meg: '添加/更新失败',
              err
            })
          })
        })
      },
      gets() {
        return {
          identity() {
            return new Promise((resolve, reject) => {
              cloud.callFunction({
                name: 'userDB',
                data: {
                  operate: 'gets-check_index',
                }
              }).then(res => {
                resolve(res)
              }).catch(err => {
                reject(err)
              })
            })
          }
        }
      },
      getField() {
        return {
          name() {
            return new Promise((resolve, reject) => {
              cloud.callFunction({
                name: 'userDB',
                data: {
                  operate: 'get-name',
                }
              }).then(res => {
                resolve(res.result.data)
              }).catch(err => {
                reject(err)
              })
            })
          },
        }
      }
    }
  },

  stringify(obj) {
    if (obj == null || obj == undefined) {
      return
    }
    let s = {}
    for (let [key, value] of Object.entries(obj)) {
      if (value.constructor == Number || value.constructor == Boolean || value.constructor == String) {
        s[key] = value
      } else {
        s[key] = JSON.stringify(value)
      }
    }
    console.log(s);
    return s
  },

  Request(api) {
    let that = this
    return {
      POST(data) {
        return new Promise((resolve, reject) => {
          wx.request({
            // url: `http://60.205.176.207:9000` + api,
            url: `https://gzx.asia:9000` + api,
            header: {
              'content-type': 'application/x-www-form-urlencoded',
            },
            method: 'POST',
            data: that.stringify(data),
            timeout: 100000,
            success: (res) => {
              resolve(res)
            },
            fail: (err) => {
              reject(err)
            },
          })
        })
      }
    }
  }
})