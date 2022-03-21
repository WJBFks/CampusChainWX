// pages/gathering/initiate/initiate.js
import WxValidate from '../../../assets/plugins/wx-validate/WxValidate'
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    creator: null,
    time_from: '2022-01-01',
    time_to: '2022-01-01',
    isDate: false,
    gathering_name: null,
    gathering_desc: null,
    detail: [],
    type_picker: ['列表', '字符串', '整数', '小数'],
    type_picker_list: ['字符串', '整数', '小数'],
    date: '',
    time: '',
  },


  onLoad: function (options) {
    this.getTimestamp()
    this.initValidate()
    this.getUserInfo()
    this.addDetail()
  },

  getUserInfo() {
    return new Promise((resolve, reject) => {
      app.User().get()
        .then(res => {
          this.setData({
            creator: res
          })
          resolve(res);
        }).catch(err => {
          reject(err)
        })
    })
  },

  DateChange(e) {
    this.setData({
      date: e.detail.value
    })
  },

  TimeChange(e) {
    this.setData({
      time: e.detail.value
    })
    let t = new Date(this.data.date + ' ' + this.data.time).getTime()
  },

  switchChange(e) {
    this.setData({
      isDate: e.detail.value
    })
  },

  getTimestamp() {
    let ts = app.getTimeStamp(app.getTimeStamp().timestamp + 1000 * 60 * 60)
    console.log(ts);
    this.setData({
      date: ts.date(),
      time: ts.time(),
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
      let time_from = app.getTimeStamp().timestamp
      let time_to = this.data.isDate == true ? app.getTimeStamp(this.data.date + ' ' + this.data.time).timestamp : ''
      let id = 'gat-' + time_from
      let gathering = {
        gat_id: id,
        name: params.gathering_name,
        description: params.gathering_desc,
        creator: app.globalData.openid,
        time_from: time_from + '',
        time_to: time_to + '',
        len: 0,
        enable: true,
      }
      console.log(gathering);
      let head = []
      let type = []
      for (let i = 0; i < this.data.detail.length; i++) {
        let item = params[('item' + i)]
        let t = this.data.detail[i]
        let type_main = this.typeTrans(this.data.type_picker[t.type_index])
        let types = ''
        if (type_main != 'list') {
          types += type_main
        } else {
          let list_type = this.typeTrans(this.data.type_picker_list[t.list_type_index])
          types += list_type
          if (t.list_len == '') {
            t.list_len = 0
          }
          types += ' list-' + t.list_len
        }
        if (item != null) {
          head.push(item)
        }
        if (t.required) {
          let re = t.list_required
          if (re == null || re == "" || re.length == 0) {
            if (t.list_len == 0) {
              re = 1
            } else {
              re = t.list_len
            }
          }
          types += ' required-' + re
        }
        type.push(types)
      }
      let detail = {
        det_gat_id: 'det-' + id,
        head,
        type,
      }
      console.log(detail);
      wx.showLoading({
        title: '正在提交',
        mask: true,
      })
      app.Request('/gathering/update').POST({
          gathering,
          detail,
        })
        .then(res => {
          console.log(res);
          wx.showToast({
            title: '提交成功',
            icon: 'success',
            duration: 1000,
            mask: true,
          })
          setTimeout(() => {
            wx.navigateBack()
          }, 1000)
        }).then(err => {
          console.log(err);
          wx.showToast({
            title: '提交失败',
            icon: 'error',
            duration: 1000
          })
        })

    }
  },

  typeTrans(str) {
    switch (str) {
      case '字符串':
        return 'string'
      case '整数':
        return 'int'
      case '小数':
        return 'float'
      case '列表':
        return 'list'
    }
  },

  initValidate() {
    var rules = {
      gathering_name: {
        required: true
      }
    }
    let len = this.data.detail.length
    rules['time'] = {
      time: true
    }
    for (let i = 0; i < len; i++) {
      rules['item' + i] = {
        required: true
      }
    }
    var messages = {
      gathering_name: {
        required: '请输入收集表名'
      }
    }
    for (let i = 0; i < len; i++) {
      messages['item' + i] = {
        required: '表项' + (i + 1 < 10 ? '0' + (i + 1) : i + 1) + '的表项名不能为空'
      }
    }
    console.log(messages);
    this.WxValidate = new WxValidate(rules, messages)
    this.WxValidate.addMethod('time', (value, param) => {
      let t = app.getTimeStamp(this.data.date + ' ' + this.data.time).timestamp
      let t1 = app.getTimeStamp().timestamp
      if (t > t1) {
        return true
      } else {
        return false
      }
    }, '截止日期不能早于当前时间')
  },

  showModal(error) {
    wx.showModal({
      content: error.msg,
      showCancel: false,
    })
  },

  addDetail() {
    console.log(this.data.detail);
    let detail = this.data.detail
    detail.push({
      required: true
    })
    this.PickerChange({
      currentTarget: {
        id: detail.length - 1,
      },
      detail: {
        value: 0,
      }
    })
    this.setData({
      detail
    })
    this.initValidate()
  },

  switchChange2(e) {
    console.log(e);
    let id = Number(e.currentTarget.id)
    let value = e.detail.value
    let detail = this.data.detail
    detail[id].required = value
    if (!value && detail[id].list_required != null) {
      detail[id].list_required = ''
    }
    this.setData({
      detail
    })
    console.log(this.data.detail);
  },

  PickerChange(e) {
    console.log(e);
    let id = Number(e.currentTarget.id)
    let index = Number(e.detail.value)
    let detail = this.data.detail
    let required = detail[id].required
    let d = {
      type_index: index,
      required,
    }
    console.log(index);
    switch (this.data.type_picker[index]) {
      case '字符串':
      case '整数':
      case '小数':
        break;
      case '列表':
        d.list_len = ''
        d.list_type_index = 0
        d.list_required = ''
    }
    detail[id] = d
    this.setData({
      detail
    })
  },

  ListPickerChange(e) {
    console.log(e);
    let id = Number(e.currentTarget.id)
    let index = Number(e.detail.value)
    let detail = this.data.detail
    detail[id].list_type_index = index
    this.setData({
      detail
    })
  },

  listLenChange(e) {
    let id = Number(e.currentTarget.id)
    let value = e.detail.value
    let index = Number(e.detail.value)
    let detail = this.data.detail
    let i = Number(index)
    if (value == '') {
      detail[id].list_len = ''
    } else if (!isNaN(i)) {
      i = Math.floor(i)
      if (i < 1) {
        i = 1
      }
      detail[id].list_len = i
    }

    this.setData({
      detail
    })
  },

  listReqChange(e) {
    let id = Number(e.currentTarget.id)
    let value = e.detail.value
    let index = Number(e.detail.value)
    let detail = this.data.detail
    let i = Number(index)
    if (value == '') {
      detail[id].list_required = ''
    } else if (!isNaN(i)) {
      i = Math.floor(i)
      if (i < 0) {
        i = 0
      } else if (detail[id].list_len != 0 && i > detail[id].list_len) {
        i = detail[id].list_len
      }
      detail[id].list_required = i
    }

    if (value != '') {
      if (detail[id].list_required == 0) {
        detail[id].required = false
      } else {
        detail[id].required = true
      }
    }
    this.setData({
      detail
    })
  },

  listReqLen(e) {
    let id = Number(e.currentTarget.id)
    let detail = this.data.detail
    if (detail[id].list_len < detail[id].list_required) {
      detail[id].list_required = detail[id].list_len
      this.setData({
        detail
      })
    }
  },
})