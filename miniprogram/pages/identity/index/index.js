const db = wx.cloud.database();
const app = getApp();
const cloud = wx.cloud
wx.cloud.init()

const btn_group = '身份组管理'
const btn_check = '身份审核'

Page({

  BTNs(e) {
    let btn = e.currentTarget.id
    console.log(btn);
    switch (btn) {
      case btn_group:
        wx.navigateTo({
          url: "/pages/identity/group/group?authority=" + '100'
        })
        return;
      case btn_check:
        wx.navigateTo({
          url: "/pages/identity/check/index/index?authority=" + '100'
        })
        return;
    }
  },

  data: {
    tabs: ['身份管理', '我的身份'],
    TabCur: 0,
    scrollLeft: 0,
    btns: [btn_group, btn_check],
    // 我的身份
    user: null,
    status: '等待提交',
    groups: [],
    uIndex: 0,
    uPicker: [],
    sIndex: 0,
    sPicker: [],
    gIndex: 0,
    gPicker: [],
    mIndex: 0,
    mPicker: [],
    cIndex: 0,
    cPicker: [],
    name: '',
    number: '',
    gender: '',
    phone: '',
    email: '',
    qq: '',
    authority: 0,
    identity: '学生',
  },

  onLoad: function (options) {
    console.log(options);
    if (options.tab) {
      this.setData({
        TabCur: options.tab
      })
    }
  },

  onPullDownRefresh: function (options) {
    this.load()
  },

  onShow: function (options) {
    this.load()
  },

  load() {
    // 我的身份
    this.getGroups()
      .then(res => {
        let uPicker = []
        for (let i = 0; i < this.data.groups.length; i++) {
          uPicker.push(this.data.groups[i].university)
        }
        this.setData({
          uPicker
        })
      })
      .then(res => {
        return this.getIdentity()
      })
      .then(res => {
        this.pickChange()
      })
  },

  tabSelect(e) {
    this.setData({
      TabCur: e.currentTarget.dataset.id,
      scrollLeft: (e.currentTarget.dataset.id - 1) * 60
    })
  },

  swiperChange(e) {
    let id = e.detail.current
    this.setData({
      TabCur: id,
      scrollLeft: (id - 1) * 60
    })
  },

  getGroups() {
    return db.collection('params').doc('groups').get()
      .then(res => {
        this.setData({
          groups: res.data.schools
        })
      })
  },

  // 我的身份
  uPickerChange(e) {
    let uIndex = e.detail.value
    this.setData({
      uIndex,
      sIndex: 0,
      gIndex: 0,
      mIndex: 0,
      cIndex: 0,
    })
    this.pickChange()
  },

  sPickerChange(e) {
    let sIndex = e.detail.value
    this.setData({
      sIndex,
      gIndex: 0,
      mIndex: 0,
      cIndex: 0,
    })
    this.pickChange()
  },

  gPickerChange(e) {
    let gIndex = e.detail.value
    this.setData({
      gIndex,
      mIndex: 0,
      cIndex: 0,
    })
    this.pickChange()
  },

  mPickerChange(e) {
    let mIndex = e.detail.value
    this.setData({
      mIndex,
      cIndex: 0,
    })
    this.pickChange()
  },

  cPickerChange(e) {
    let cIndex = e.detail.value
    this.setData({
      cIndex,
    })
  },

  getIdentity() {
    app.User().get()
      .then(res => {
        console.log(res);
        this.setData({
          user: res
        })
        if (res.identity != null) {
          this.setData({
            name: res.identity.name,
            number: res.identity.number,
            phone: res.identity.phone,
            gender: res.identity.gender,
            email: res.identity.email,
            qq: res.identity.qq,
            status: res.identity.status,
            authority: res.identity.authority,
            identity:app.getIdentity(res.identity.authority),
          })
          let groups = this.data.groups
          let id = res.identity
          // 大学
          let ui = 0
          for (; ui < groups.length; ui++)
            if (groups[ui].university == id.university) break
          this.setData({
            uIndex: ui
          })
          if (ui == groups.length) return
          // 学院
          let si = 0
          for (; si < groups[ui].schools.length; si++)
            if (groups[ui].schools[si].school == id.school) break
          this.setData({
            sIndex: si
          })
          if (si == groups[ui].schools.length) return
          // 年级
          let gi = 0
          for (; gi < groups[ui].schools[si].grades.length; gi++)
            if (groups[ui].schools[si].grades[gi].grade == id.grade) break
          this.setData({
            gIndex: gi
          })
          if (gi == groups[ui].schools[si].grades.length) return
          // 专业
          let mi = 0
          for (; mi < groups[ui].schools[si].grades[gi].majors.length; mi++)
            if (groups[ui].schools[si].grades[gi].majors[mi].major == id.major) break
          this.setData({
            mIndex: mi
          })
          if (mi == groups[ui].schools[si].grades[gi].majors.length) return
          // 班级
          let ci = 0
          for (; ci < groups[ui].schools[si].grades[gi].majors[mi].classes.length; ci++)
            if (groups[ui].schools[si].grades[gi].majors[mi].classes[ci] == id.class) break
          this.setData({
            cIndex: ci
          })
        }
      })
  },

  pickChange() {
    let groups = this.data.groups
    let sPicker = []
    let gPicker = []
    let mPicker = []
    let cPicker = []
    let uIndex = this.data.uIndex
    let sIndex = this.data.sIndex
    let gIndex = this.data.gIndex
    let mIndex = this.data.mIndex
    sPicker = groups[uIndex].schools.map(item => {
      return item.school;
    })
    this.setData({
      sPicker
    })
    if (sPicker.length == 0) {
      this.setData({
        gPicker: [],
        mPicker: [],
        cPicker: [],
        sIndex: 0,
        gIndex: 0,
        mIndex: 0,
        cIndex: 0,
      })
      return
    }
    gPicker = groups[uIndex].schools[sIndex].grades.map(item => {
      return item.grade;
    })
    this.setData({
      gPicker
    })
    if (gPicker.length == 0) {
      this.setData({
        mPicker: [],
        cPicker: [],
        gIndex: 0,
        mIndex: 0,
        cIndex: 0,
      })
      return
    }
    mPicker = groups[uIndex].schools[sIndex].grades[gIndex].majors.map(item => {
      return item.major;
    })
    this.setData({
      mPicker
    })
    if (mPicker.length == 0) {
      this.setData({
        cPicker: [],
        mIndex: 0,
        cIndex: 0,
      })
      return
    }
    cPicker = groups[uIndex].schools[sIndex].grades[gIndex].majors[mIndex].classes
    this.setData({
      cPicker
    })
    if (mPicker.length == 0) {
      this.setData({
        cIndex: 0,
      })
      return
    }
  },

  genderChange(e) {
    this.setData({
      gender: e.detail.value
    })
  },

  inputChange(e) {
    let str = e.detail.value
    let id = e.currentTarget.id
    switch (id) {
      case 'name':
        this.setData({
          name: str
        })
        break;
      case 'number':
        this.setData({
          number: str
        })
        break;
      case 'phone':
        this.setData({
          phone: str
        })
        break;
      case 'email':
        this.setData({
          email: str
        })
        break;
      case 'qq':
        this.setData({
          qq: str
        })
        break;
    }
    console.log(str);
  },

  saveIdentiy() {
    let d = this.data
    let identity = {
      university: d.uPicker[d.uIndex],
      school: d.sPicker[d.sIndex],
      grade: d.gPicker[d.gIndex],
      major: d.mPicker[d.mIndex],
      class: d.cPicker[d.cIndex],
      authority: d.authority,
      name: d.name,
      number: d.number,
      gender: d.gender,
      phone: d.phone,
      email: d.email,
      qq: d.qq,
      status: '审核中',
    }
    const isEmpty = (str) => {
      if (str == null || str == undefined) {
        return true
      }
      if (str == "" || str.length == 0) {
        return true
      }
    }
    if (isEmpty(identity.university)) {
      wx.showToast({
        title: '大学不能为空',
        icon: 'error',
        duration: 1000
      })
      return
    }
    if (isEmpty(identity.school)) {
      wx.showToast({
        title: '学院不能为空',
        icon: 'error',
        duration: 1000
      })
      return
    }
    if (isEmpty(identity.grade)) {
      wx.showToast({
        title: '年级不能为空',
        icon: 'error',
        duration: 1000
      })
      return
    }
    if (isEmpty(identity.major)) {
      wx.showToast({
        title: '专业不能为空',
        icon: 'error',
        duration: 1000
      })
      return
    }
    if (isEmpty(identity.class)) {
      wx.showToast({
        title: '班级不能为空',
        icon: 'error',
        duration: 1000
      })
      return
    }
    if (isEmpty(identity.name)) {
      wx.showToast({
        title: '姓名不能为空',
        icon: 'error',
        duration: 1000
      })
      return
    }
    if (isEmpty(identity.number)) {
      wx.showToast({
        title: '学号不能为空',
        icon: 'error',
        duration: 1000
      })
      return
    }
    if (isEmpty(identity.phone)) {
      wx.showToast({
        title: '手机不能为空',
        icon: 'error',
        duration: 1000
      })
      return
    }
    if (isEmpty(identity.gender)) {
      wx.showToast({
        title: '性别不能为空',
        icon: 'error',
        duration: 1000
      })
      return
    }
    wx.showLoading({
      title: '正在保存',
      mask: true,
    })
    return app.User().addup({
        identity: identity
      })
      .then(res => {
        this.onShow()
        wx.pageScrollTo({
          selector: '#scroll',
          scrollTop: 0,
          duration: 300
        }).then(res => {
          console.log(res);
        })
        wx.showToast({
          title: '保存成功',
          icon: 'success',
          duration: 500
        })
      }).catch(err => {
        wx.showToast({
          title: '保存失败',
          icon: 'error',
          duration: 500
        })
      })
  }
})