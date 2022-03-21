const db = wx.cloud.database();
// pages/identity/group/group.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    deleteModal: '',
    groups: [],
  },

  onLoad: function (options) {
    this.getGroups()
  },

  inputChange(e) {
    let ids = e.target.id.split('-')
    let str = e.detail.value
    let groups = this.data.groups
    let u, s, g, m, c;
    if (str != '') {
      switch (ids.length) {
        case 1:
          u = Number(ids[0])
          if (u < groups.length) {
            groups[u].university = str
          } else {
            groups.push({
              university: str,
              schools: []
            })
          }
          break;
        case 2:
          u = Number(ids[0])
          s = Number(ids[1])
          if (s < groups[u].schools.length) {
            groups[u].schools[s].school = str
          } else {
            groups[u].schools.push({
              school: str,
              grades: []
            })
          }
          break;
        case 3:
          u = Number(ids[0])
          s = Number(ids[1])
          g = Number(ids[2])
          if (g < groups[u].schools[s].grades.length) {
            groups[u].schools[s].grades[g].grade = str
          } else {
            groups[u].schools[s].grades.push({
              grade: str,
              majors: []
            })
          }
          break;
        case 4:
          u = Number(ids[0])
          s = Number(ids[1])
          g = Number(ids[2])
          m = Number(ids[3])
          if (m < groups[u].schools[s].grades[g].majors.length) {
            groups[u].schools[s].grades[g].majors[m].major = str
          } else {
            groups[u].schools[s].grades[g].majors.push({
              major: str,
              classes: []
            })
          }
          break;
        case 5:
          u = Number(ids[0])
          s = Number(ids[1])
          g = Number(ids[2])
          m = Number(ids[3])
          c = Number(ids[4])
          if (c < groups[u].schools[s].grades[g].majors[m].classes.length) {
            groups[u].schools[s].grades[g].majors[m].classes[c] = str
          } else {
            groups[u].schools[s].grades[g].majors[m].classes.push(str)
          }
          break;
      }
    } else {
      switch (ids.length) {
        case 1:
          u = Number(ids[0])
          if (u < groups.length) {
            if (groups[u].schools.length > 0) {
              this.setData({
                deleteModal: e.target.id
              })
            } else {
              groups.splice(u, 1)
            }
          }
          break;
        case 2:
          u = Number(ids[0])
          s = Number(ids[1])
          if (s < groups[u].schools.length) {
            if (groups[u].schools[s].grades.length > 0) {
              this.setData({
                deleteModal: e.target.id
              })
            } else {
              groups[u].schools.splice(s, 1)
            }
          }
          break;
        case 3:
          u = Number(ids[0])
          s = Number(ids[1])
          g = Number(ids[2])
          if (g < groups[u].schools[s].grades.length) {
            if (groups[u].schools[s].grades[g].majors.length > 0) {
              this.setData({
                deleteModal: e.target.id
              })
            } else {
              groups[u].schools[s].grades.splice(g, 1)
            }
          }
          break;
        case 4:
          u = Number(ids[0])
          s = Number(ids[1])
          g = Number(ids[2])
          m = Number(ids[3])
          if (m < groups[u].schools[s].grades[g].majors.length) {
            if (groups[u].schools[s].grades[g].majors[m].classes.length > 0) {
              this.setData({
                deleteModal: e.target.id
              })
            } else {
              groups[u].schools[s].grades[g].majors.splice(m, 1)
            }
          }
          break;
        case 5:
          u = Number(ids[0])
          s = Number(ids[1])
          g = Number(ids[2])
          m = Number(ids[3])
          c = Number(ids[4])
          if (c < groups[u].schools[s].grades[g].majors[m].classes.length) {
            groups[u].schools[s].grades[g].majors[m].classes.splice(c, 1)
          }
          break;
      }
    }
    this.setData({
      groups
    })
  },

  hidedeleteModal() {
    this.setData({
      deleteModal: ''
    })
  },

  deleteModalConfirm() {
    let ids = this.data.deleteModal.split('-')
    let groups = this.data.groups
    let u, s, g, m, c;
    switch (ids.length) {
      case 1:
        u = Number(ids[0])
        if (u < groups.length) {
          groups.splice(u, 1)
        }
        break;
      case 2:
        u = Number(ids[0])
        s = Number(ids[1])
        if (s < groups[u].schools.length) {
          groups[u].schools.splice(s, 1)
        }
        break;
      case 3:
        u = Number(ids[0])
        s = Number(ids[1])
        g = Number(ids[2])
        if (g < groups[u].schools[s].grades.length) {
          groups[u].schools[s].grades.splice(g, 1)
        }
        break;
      case 4:
        u = Number(ids[0])
        s = Number(ids[1])
        g = Number(ids[2])
        m = Number(ids[3])
        if (m < groups[u].schools[s].grades[g].majors.length) {
          groups[u].schools[s].grades[g].majors.splice(m, 1)
        }
        break;
      case 5:
        u = Number(ids[0])
        s = Number(ids[1])
        g = Number(ids[2])
        m = Number(ids[3])
        c = Number(ids[4])
        if (c < groups[u].schools[s].grades[g].majors[m].classes.length) {
          groups[u].schools[s].grades[g].majors[m].classes.splice(c, 1)
        }
        break;
    }
    this.setData({
      groups
    })
    this.hidedeleteModal()
  },

  getGroups() {
    return db.collection('params').doc('groups').get()
      .then(res => {
        this.setData({
          groups: res.data.schools
        })
      })
  },

  reGetGroups() {
    wx.showLoading({
      title: '正在恢复',
      mask: true,
    })
    this.getGroups()
      .then(res => {
        wx.showToast({
          title: '恢复成功',
          icon: 'success',
          duration: 500
        })
      }).catch(err => {
        wx.showToast({
          title: '恢复失败',
          icon: 'error',
          duration: 500
        })
      })
  },

  saveGroups() {
    wx.showLoading({
      title: '正在保存',
      mask: true,
    })
    let groups = this.data.groups
    db.collection('params').add({
        data: {
          _id: 'groups',
          schools: groups,
        }
      })
      .catch(err => {
        return db.collection('params').doc('groups').update({
          data: {
            schools: groups,
          }
        })
      })
      .then(res => {
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
  },
})