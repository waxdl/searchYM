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

  checkItems: function (e) {
    var $this = this;
    var form = e.detail.value;
    var keys = form.values.split(/[\n]/);
    var list = [],
        count = 0, 
        pass = 0;

    for (var i = 0; i < keys.length; i++) {
      var key = keys[i].trim();
      if (key) {
        count++;
        var isException = config.ErrorMap[key];
        if (!isException)
          pass++;
        list.push({
          key: key,
          isException: isException
        });
      }
    }

    if (!count) {
      wx.showModal({
        title: "温馨提示",
        content: "哥，什么都没输入呢",
        showCancel: false,
        confirmText: "确定"
      });
      return;
    }    
    
    var isPass = pass == count;
    var msgs = isPass ? config.OkMsg : config.ErrorMsg,
      index = Math.floor(Math.random() * msgs.length);

    $this.setData({
      list: [{
        key: isPass ? '通过' : '不通过',
        isException: !isPass
      }].concat(list),
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
  }
})