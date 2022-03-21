// pages/gathering/fill/fill.js
import WxValidate from '../../../assets/plugins/wx-validate/WxValidate'
const app = getApp()
const cloud = wx.cloud
wx.cloud.init()
Page({

  data: {
    id: null,
    gathering: null,
    detail: null,
    creator: null,
    head: null,
    types: null,
    tv: []
  },

  onLoad: function (options) {
    let id = options.id
    this.setData({
      id
    })
    this.getGatheringByID(id)
      .then(res => {
        this.initValidate()
        return this.getUserInfo()
      })
      .then(res => {
        console.log(res);
      })
  },

  getGatheringByID(id) {
    return new Promise((resolve, reject) => {
      app.Request('/gathering/query').POST({
          gat_id: this.data.id,
          gathering: "true",
          detail: "true",
          lines: "false",
        }).then(res => {
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
              head: d.head,
              status: 4,
            })
            return d.type
          } catch (err) {
            this.setData({
              status: 3,
            })
            throw '收集表详情加载失败'
          }
        })
        .then(ts => {
          let types = []
          let tv = []
          for (let t of ts) {
            let tt = Types(t)
            types.push(tt)
            if (tt.list_len == 0) {
              tv.push(new Array(1))
            } else {
              tv.push(new Array(tt.required))
            }
          }
          this.setData({
            types,
            tv,
          })
          resolve()
        })
    })
  },

  getUserInfo() {
    return new Promise((resolve, reject) => {
      cloud.callFunction({
        name: 'userDB',
        data: {
          operate: 'get',
          openid: this.data.gathering.creator
        }
      }).then(res => {
        this.setData({
          creator: res.result.userInfo
        })
        resolve(res.result.userInfo);
      }).catch(err => {
        reject(err)
      })
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
      let p = {}
      for (let [k, v] of Object.entries(params)) {
        console.log(k, v);
        let kn = ''
        let kt = ''
        for (let c of k) {
          if (c != '-') {
            kt += c
          } else {
            kn += kt
            kt = '-'
          }
        }
        if (kt == '-') {
          p[kn] = v
        } else if (v != '' && v != undefined) {
          let l = p[kn]
          if (l == null) {
            l = []
          }
          l.push(v)
          p[kn] = l
        }
      }
      let line = []
      for (let [_, v] of Object.entries(p)) {
        if (v.constructor == String) {
          line.push(v)
        } else {
          line.push(JSON.stringify(v))
        }
      }
      console.log(line);
      console.log(params);
    }
  },

  initValidate() {
    let tv = this.data.tv
    var rules = {}
    var messages = {}
    for (let i = 0; i < tv.length; i++) {
      let head = this.data.head[i];
      let tt = this.data.types[i]
      for (let j = 0; j < tv[i].length; j++) {
        let name = head + '-' + (tv[i].length > 1 || tt.list_len == 0 ? j + 1 : '')
        console.log(name);
        let tip = head + (tv[i].length > 1 || tt.list_len == 0 ? '-' + (j + 1) : '')
        let index = i + 1 < 10 ? '0' + (i + 1) : i + 1
        let pre = '[' + index + ']' + tip + '：'
        rules[name] = {
          required: j < tt.required,
          int: tt.type == 'int',
          float: tt.type == 'float',
        }
        messages[name] = {
          required: pre + '不能为空',
          int: pre + '只能输入整数',
          float: pre + '只能输入数字',
        }
      }
    }
    this.WxValidate = new WxValidate(rules, messages)
    //自定义规则
    this.WxValidate.addMethod('int', (value, param) => {
      if (!param) {
        return true
      }
      if ((value[0] < '0' || value[0] > '9') && value[0] != '-') {
        return false
      }
      for (let i = 1; i < value.length; i++) {
        let c = value[i]
        if (c < '0' || c > '9') {
          return false;
        }
      }
      return true
    })
    this.WxValidate.addMethod('float', (value, param) => {
      if (!param) {
        return true
      }
      if ((value[0] < '0' || value[0] > '9') && value[0] != '-') {
        return false
      }
      let point = false
      for (let i = 1; i < value.length; i++) {
        let c = value[i]
        if (c < '0' || c > '9') {
          if (c == '.') {
            if (!point) {
              point = true
            } else {
              return false;
            }
          } else {
            return false;
          }
        }
      }
      return true
    })
  },

  showModal(error) {
    wx.showModal({
      content: error.msg,
      showCancel: false,
    })
  },

  inputItem(e) {
    let id = e.currentTarget.id.split('-')
    let value = e.detail.value
    let ti = id[0]
    let i = id[1]
    let tv = this.data.tv
    let tt = this.data.types[ti]
    console.log(ti, i);
    tv[ti][i] = value
    let ttt1 = []
    let ttt2 = []
    let t1noNull = 0
    for (let i = 0; i < tt.required; i++) {
      ttt1.push(tv[ti][i])
      console.log(tv[ti][i]);
      if (tv[ti][i] != '' && tv[ti][i] != undefined) {
        t1noNull++
      }
    }
    console.log(tt.required, tv[ti].length);
    for (let i = tt.required; i < tv[ti].length; i++) {
      if (tv[ti][i] != '' && tv[ti][i] != undefined) {
        ttt2.push(tv[ti][i])
      }
    }
    tv[ti] = ttt1.concat(ttt2)
    if (t1noNull == tt.required && (tt.required + ttt2.length < tt.list_len || tt.list_len == 0)) {
      tv[ti].push('')
    }
    this.initValidate()
    this.setData({
      tv
    })
  },
})

function Types(T) {
  var ts = T.split(' ') // type字段数组
  var tm = ts[0] // 主要类型
  var required = false; // 必填
  var list_len = 1; //列表重复上限
  for (let i = 1; i < ts.length; i++) {
    let t = ts[i].split('-')
    let type = t[0]
    let params = t[1]
    if (type == 'list') {
      list_len = Number(params)
    } else if (type == 'required') {
      required = Number(params);
    }
  }
  return {
    type: tm,
    required,
    list_len,
  }
}