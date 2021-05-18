import components from './helpers/components'

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
    openid: ""
  },

  onLaunch: function () {
    var that = this;
    // 获取导航栏信息
    // 获取系统信息
    const systemInfo = wx.getSystemInfoSync();
    // 胶囊按钮位置信息
    const menuButtonInfo = wx.getMenuButtonBoundingClientRect();
    //
    that.globalData.navTop = systemInfo.statusBarHeight;
    // 导航栏间距 = （胶囊距上距离-状态栏高度）
    that.globalData.navDis = (menuButtonInfo.top - systemInfo.statusBarHeight);
    // 导航栏高度 = 导航栏间距 * 2 + 胶囊高度 + 状态栏高度
    that.globalData.navBarHeight = that.globalData.navDis * 2 + menuButtonInfo.height + systemInfo.statusBarHeight;
    that.globalData.menuRight = systemInfo.screenWidth - menuButtonInfo.right;
    that.globalData.menuBotton = menuButtonInfo.top - systemInfo.statusBarHeight;
    that.globalData.menuHeight = menuButtonInfo.height;
    // 云函数初始化
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        // env: 'my-env-id',
        traceUser: true,
      })
    }

    let openID;
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
        that.globalData.openid = openID;
        console.log('openID获取完成');
      }, err => {
        console.log('openID获取失败');
        console.log(err);
      })
      .catch(err => {
        console.log('openID获取失败');
        console.log(err);
      })
  }
})