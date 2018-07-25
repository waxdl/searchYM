// page/searchYM.js
var config = require('../config.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    lists: [],
    isChecking: false,
    msg: config.Title,
    showImg: false,
    errorList: Object.keys(config.ErrorMap),
    resultMsg: '',
    
    canvasHidden: true,     //设置画板的显示与隐藏，画板不隐藏会影响页面正常显示
    wxappName: '查益苗',     //小程序名称
    shareImgPath: '',       //分享图片路径
  },

  onLoad: function (e) {
      
  },

  resetCheck: function (e) {
    this.setData({
      lists: [],
      isChecking: false,
      msg: config.Title,
      showImg: false,
    });
  },

  checkRule: function (keys) {
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i].trim();
      if (!/^[\A-Z0-9\-]{6,12}$/.test(key)) {
        return false;
      }      
    }

    return true;
  },
  checkItems: function (e) {
    var $this = this;
    var form = e.detail.value;
    var keys = form.values.split(/[\n]/);
    var list = [], 
        count = 0,
        pass = 0;

    if (form.values == "") {
      wx.showModal({
        title: "温馨提示",
        content: "什么都没有输入呢~",
        showCancel: false,
        confirmText: "确定"
      });
      return;
    }  

    if (!$this.checkRule(keys)) {
      wx.showModal({
        title: "提示",
        content: "要输入规范的疫苗批号哦~",
        showCancel: false,
        confirmText: "确定"
      });
      return;
    }

    for (var i = 0; i < keys.length; i++) {
      var key = keys[i].trim();
      if (key) {
        count++;
        var isException = config.ErrorMap[key];
        if (isException===undefined)
          isException = false
        if (!isException)
          pass++;
        list.push({
          key: key,
          isException: isException
        });
      }
    }  
    
    var isPass = pass == count;
    var msgs = isPass ? config.OkMsg : config.ErrorMsg,
      index = Math.floor(Math.random() * msgs.length);

    $this.setData({
      list: [{
        key: isPass ? '通过' : '不通过',
        isException: !isPass
      }].concat(list),
      lists: list,
      isChecking: true,
      msg: msgs[index],
      resultMsg: msgs[index] + ' -- 益苗君'
    });
  },

  showImg: function () {
    this.setData({
      showImg: !this.data.showImg
    })
  },

  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: this.data.resultMsg || config.ResultMsg,
      path: '/page/searchYM'
    }
  },

  getCanvasSize: function () {
    //获取用户设备信息，屏幕宽度  
    var res = wx.getSystemInfoSync();
    var scaleH = 940 / 750;     //生成图片的宽高比例
    var size = {};
    size.w = res.windowWidth;//画布宽度
    size.h = res.windowWidth * scaleH; //画布的高度  

    return size;
  },
  //定义的保存图片方法
  shareResult:function () {
    wx.showLoading({
      title: '图片保存中...',
    })

    var that = this;
    //设置画板显示，才能开始绘图
    that.setData({
      canvasHidden: false
    })

    var size = that.getCanvasSize()
    var context = wx.createCanvasContext('share')
    var wxappName = "来「 " + that.data.wxappName + " 」查询疫苗是否合格"
    var path1 = "/image/bg.png"
    var path2 = "/image/qrcode.png"
    context.drawImage(path1, 0, 0, size.w, size.h)  
    context.drawImage(path2, size.w / 10 , size.h * 0.8, 60, 60)
    context.setFontSize(16)    
    context.fillText("查询结果:", size.w / 10, size.h * 0.2)
    context.setFillStyle("#999")
    context.fillText("————————————————", size.w / 10, size.h * 0.25)
    context.setFillStyle("black")
    var lists = that.data.lists;
    var length = that.data.lists.length;
    for (var i = 0; i < length; i++) {
      var key = lists[i].key;
      var result = lists[i].isException == true ? '不合格' : '合格';
      var y = size.h * 0.3 + i * 30;
      context.fillText(key + " : ", size.w / 10, y)
      context.fillText(result, size.w / 10 + 200, y)
    }
    context.setFontSize(12)
    context.setFillStyle("#999")
    context.fillText("长按图片识别小程序", size.w / 10 + 70, size.h * 0.85)
    context.fillText(wxappName, size.w / 10 + 70, size.h * 0.9)
    //把画板内容绘制成图片，并回调 画板图片路径
    context.draw(false, function () {
      wx.canvasToTempFilePath({        
        canvasId: 'share',
        success: function (res) {
          that.setData({
            shareImgPath: res.tempFilePath
          })
          if (!res.tempFilePath) {
            wx.showModal({
              title: '提示',
              content: '图片绘制中，请稍后重试',
              showCancel: false
            })
          }
          console.log(that.data.shareImgPath)
          //画板路径保存成功后，调用方法吧图片保存到用户相册
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            //保存成功失败之后，都要隐藏画板，否则影响界面显示。
            success: (res) => {
              console.log(res)
              wx.hideLoading()
              that.setData({
                canvasHidden: true
              })
            },
            fail: (err) => {
              console.log(err)
              wx.hideLoading()
              that.setData({
                canvasHidden: true
              })
            }
          })
        }
      })
    });
  },
})