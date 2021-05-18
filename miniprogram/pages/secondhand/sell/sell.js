// pages/secondhand/sell/sell.js
import WxValidate from '../../../assets/plugins/wx-validate/WxValidate'
const db = wx.cloud.database()

const degree = ["全新未拆封", "全新仅拆封", "外观完好功能齐全", "略有瑕疵但功能齐全", "主要功能齐全", "有较大瑕疵"];
var Timestamp;
var rand;
var sequenceNum = 0;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    day: "2022-01-01",
    openid: "",
    index: null,
    picker: degree,
    date: null,
    imgList: [],
    cursor: 0,
    onInputing: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getTimestamp();
    this.getRand();
    this.initValidate()
    wx.getStorage({
        key: 'openID',
      })
      .then(res => {
        this.setData({
          openid: res.data
        })
      }, err => {
        console.log("openid获取出错");
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

  DateChange(e) {
    this.setData({
      date: e.detail.value
    })
  },

  ChooseImage() {
    wx.chooseImage({
      count: 4, //默认9
      sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album'], //从相册选择
      success: (res) => {
        if (this.data.imgList.length != 0) {
          this.setData({
            imgList: this.data.imgList.concat(res.tempFilePaths)
          })
        } else {
          this.setData({
            imgList: res.tempFilePaths
          })

        }
      }
    });
  },

  ViewImage(e) {
    wx.previewImage({
      urls: this.data.imgList,
      current: e.currentTarget.dataset.url
    });
  },

  DelImg(e) {
    wx.showModal({
      title: '',
      content: '确定要移除这张图片吗',
      cancelText: '取消',
      confirmText: '确定',
      success: res => {
        if (res.confirm) {
          this.data.imgList.splice(e.currentTarget.dataset.index, 1);
          this.setData({
            imgList: this.data.imgList
          })
        }
      }
    })
  },

  submitForm(e) {
    const params = e.detail.value
    let that = this;

    // 传入表单数据，调用验证方法
    if (!this.WxValidate.checkForm(params)) {
      const error = this.WxValidate.errorList[0]
      this.showModal(error)
      return false
    } else {
      wx.showLoading({
        title: '正在提交',
        mask: true
      })
      params.degree = degree[params.degree];
      params.image = [];
      let promiseArr = [];
      for (let i = 0; i < that.data.imgList.length; i++) {
        promiseArr.push(new Promise((reslove, reject) => {
          let item = that.data.imgList[i];
          let suffix = /\.\w+$/.exec(item)[0]; //正则表达式返回文件的扩展名
          wx.cloud.uploadFile({
              cloudPath: 'user/' + that.data.openid + '/images/' + that.data.day + '/' + params.itemName + '_' + that.getSequence() + suffix, // 上传至云端的路径
              filePath: item,
            })
            .then(res => {
              console.log("图片" + i + "提交成功");
              params.image = params.image.concat(res.fileID);
              console.log(res.fileID) //输出上传后图片的返回地址
              reslove();
            }, err => {
              console.log("图片" + i + "提交失败");
              wx.hideLoading();
              wx.showToast({
                title: "提交失败",
                icon: "error",
                mask: true
              })
              reject(err);
            })
        }));
      }
      Promise.all(promiseArr).then(res => { //等数组都做完后做then方法
        db.collection('secondhand').add({
            data: {
              itemName: params.itemName,
              sellPrice: params.sellPrice,
              buyPrice: params.buyPrice,
              degree: params.degree,
              buyDate: params.buyDate,
              image: params.image,
              description: params.description,
              sellDate: that.data.day,
              buyers: [],
              unlocked: false
            }
          })
          .then(res => {
            wx.hideLoading();
            wx.showToast({
              title: "提交成功",
              mask: true
            })
            setTimeout(() => {
              wx.navigateBack({
                delta: 1
              })
            }, 1500);
            console.log(res);
          }, err => {
            console.log("提交失败，保存云函数时出错");
            wx.showToast({
              title: "提交失败",
              icon: "error",
              mask: true
            })
            console.log(err);
          })
      })
    }
  },

  initValidate() {
    const rules = {
      image: {
        required: true
      },
      itemName: {
        required: true
      },
      sellPrice: {
        required: true,
        min: 0
      },
      buyPrice: {
        required: true,
        min: 0
      },
      degree: {
        required: true
      },
      buyDate: {
        required: true
      },
      description: {
        required: true,
        minlength: 10,
        maxlength: 500
      }
    }

    const messages = {
      image: {
        required: '请选择图片'
      },
      itemName: {
        required: '请输入物品名'
      },
      sellPrice: {
        required: '请设置物品转手价格',
        min: '物品转手价格不能低于0元'
      },
      buyPrice: {
        required: '请设置物品购买价格',
        min: '物品购买价格不能低于0元'
      },
      degree: {
        required: '请选择新旧程度'
      },
      buyDate: {
        required: '请选择物品购买日期'
      },
      description: {
        required: "请输入物品描述",
        minlength: "物品描述最少需要10个字符",
        maxlength: "物品描述不可多于500个字符",
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

  textareaAInput(e) {
    this.setData({
      cursor: e.detail.cursor
    })
  },

  startInput(e) {
    this.setData({
      onInputing: true
    })
  },

  getTimestamp() {
    var n = Date.parse(new Date());
    var date = new Date(n);
    var Y = date.getFullYear();
    var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
    var D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    var h = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
    var m = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
    var s = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
    this.setData({
      day: Y + '-' + M + '-' + D
    })
    Timestamp = Y + M + D + h + m + s;
  },

  getRand() {
    rand = Math.ceil(Math.random() * 100000007);
    return rand;
  },

  getSequence() {
    sequenceNum++;

    function padding(num, length) {
      for (var len = (num + "").length; len < length; len = num.length) {
        num = "0" + num;
      }
      return num;
    }
    let se = padding(rand + sequenceNum, 10);
    return Timestamp + '_' + se;
  }
})