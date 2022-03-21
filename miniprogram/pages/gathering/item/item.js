// pages/gathering/item/item.js
const app = getApp()
const cloud = wx.cloud
wx.cloud.init()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: null,
    gathering: null,
    detail: null,
    len: 0,
    creator: null,
    status: 0,
    /**
     * 0: 加载中
     * 1: 收集表加载失败
     * 2: 收集表加载成功
     * 3: 收集表详情加载失败
     * 4：收集表详情加载成功
     */
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let id = options.id
    this.setData({
      id
    })
    console.log(id);
    this.getGatheringByID(id)
      .then(res => {
        this.getUserInfo()
      })
  },

  getGatheringByID(id) {
    return new Promise((resolve, reject) => {
      console.log(this.data.id);
      app.Request('/gathering/query').POST({
          gat_id: this.data.id,
          // gat_id: "gat-1646547483325",
          gathering: "true",
          detail: "true",
          lines: "true",
        })
        .then(res => {
          let D;
          try {
            D = JSON.parse(res.data)
            let g = JSON.parse(D.gathering)
            this.setData({
              gathering: g
            })
            return app.User(this.data.gathering.creator).get()
              .then(res => {
                this.setData({
                  creator: res,
                  status: 2,
                })
                return D
              })
          } catch (err) {
            this.setData({
              status: 1,
            })
            throw '收集表加载失败'
          }
        })
        .then(res => {
          try {
            let d = JSON.parse(res.detail)
            this.setData({
              detail: d,
              status: 4,
            })
            return res
          } catch (err) {
            this.setData({
              status: 3,
            })
            throw '收集表详情加载失败'
          }
        })
        .then(res=>{
          try {
            let l = JSON.parse(res.lines)
            this.setData({
              lines: l,
            })
            return res
          } catch (err) {
            throw 'lines加载失败'
          }
        })
        .catch(err => {
          console.log(err);
        })
      return

      this.setData({
        gathering: {
          id: 1,
          name: 'TEST1',
          description: 'TestTestTest1',
          creator: 'on8O65OUTCWDHyuvmpI7TBaUtIXw',
          timeFrom: '2022-01-10',
          timeTo: '2022-03-10',
        },
        detail: {
          gathering_id: 1,
          head: ['序号', '姓名', '学号', '绩点'],
          lines: [{
            user_id: 'on8O65OUTCWDHyuvmpI7TBaUtIXw',
            time: '2022-03-01',
            cells: [{
                content: '1',
                type: 'int'
              },
              {
                content: 'GLL',
                type: 'string'
              },
              {
                content: '20190001',
                type: 'string'
              },
              {
                content: '4.00',
                type: 'float 2'
              }
            ]
          }, {
            user_id: 'on8O65OUTCWDHyuvmpI7TBaUtIXw',
            time: '2022-03-02',
            cells: [{
                content: '2',
                type: 'int'
              },
              {
                content: 'DEE',
                type: 'string'
              },
              {
                content: '20190002',
                type: 'string'
              },
              {
                content: '3.98',
                type: 'float 2'
              }
            ]
          }, {
            user_id: 'on8O65OUTCWDHyuvmpI7TBaUtIXw',
            time: '2022-03-03',
            cells: [{
                content: '3',
                type: 'int'
              },
              {
                content: 'HYY',
                type: 'string'
              },
              {
                content: '20190003',
                type: 'string'
              },
              {
                content: '4.05',
                type: 'float 2'
              }
            ]
          }]
        }
      })
      if (this.data.detail.lines) {
        this.setData({
          len: this.data.detail.lines.length
        })
      }
      resolve()
    })
  },

  getUserInfo() {
    let p = []
    let userInfo = new Array(this.data.len)
    p.push(cloud.callFunction({
      name: 'userDB',
      data: {
        operate: 'get',
        openid: this.data.gathering.creator
      }
    }).then(res => {
      this.setData({
        creator: res.result.userInfo
      })
    }).catch(err => {
      console.log(err);
    }))
    for (let i = 0; i < this.data.len; i++) {
      p.push(cloud.callFunction({
        name: 'userDB',
        data: {
          operate: 'get',
          openid: this.data.detail.lines[i].user_id
        }
      }).then(res => {
        userInfo[i] = res.result.userInfo
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

  toFill(e) {
    let id = e.currentTarget.dataset.id
    console.log(id);
    wx.navigateTo({
      url: "/pages/gathering/fill/fill?id=" + id,
    })
  },

})