// 引用百度地图微信小程序JSAPI模块 
var bmap = require('../../libs/bmap-wx.js');

Page({

  //分享功能
  onShareAppMessage: function() {
    let that = this;
    return {
      title: '分享',
      path: 'pages/index/index',
      success: (res) => {
        console.log(res.shareTickets[0])
        wx.getShareInfo({
          shareTicket: res.shareTickets[0],
          success: (res) => {
            that.setData({
              isShow: true
            })
            console.log(that.setData.isShow)
          },
          fail: function(res) {
            console.log(res)
          },
          complete: function(res) {
            console.log(res)
          }
        })
      },
      fail: function(res) {
        console.log(res)
      }
    }
  },

  data: {
    scrollHeight: 0,
    location: 'Loading...',
  },

  onLoad: function() {
    this.calculateScrollHeight();
    this.getWeather();
  },

  // 计算滚动区域的高度
  calculateScrollHeight() {
    let windowHeight = wx.getSystemInfoSync().windowHeight
    let windowWidth = wx.getSystemInfoSync().windowWidth
    // console.log(windowHeight);
    // console.log(windowWidth);

    // 小程序任何机型的宽都是750rpx，但windowHeight和windowWidth都是px为单位，故需要转换
    let scrollHeight = windowHeight * 750 / windowWidth

    this.setData({
      scrollHeight: scrollHeight,
    });
  },

  getWeather() {
    var that = this;
    // 新建百度地图对象 
    var BMap = new bmap.BMapWX({
      ak: 'zVcyq32e7P7ouGaTIExV7wff2KhkCZOD'
    });

    var fail = function(data) {
      console.log(data)
    };

    // 获取地图数据并设置位置
    var mapSuccess = function(data) {
      console.log(data)
      var mapData = data.originalData.result.addressComponent;
      var location = mapData.city + ' ' + mapData.district;

      that.setData({
        location: location,
      })
    };

    // 发起regeocoding检索请求
    BMap.regeocoding({
      fail: fail,
      success: mapSuccess,
    });

    // 获取天气数据
    var weatherSuccess = function(data) {
      console.log(data)
      var weatherData = data.originalData.results[0];

      var currentWeatherIconDay = that.getWeatherIconDay(weatherData.weather_data[0].weather);
      var currentWeatherIconNight = that.getWeatherIconNight(weatherData.weather_data[0].weather);
      var currentTemperature = that.reverseTemperature(weatherData.weather_data[0].temperature);
      var currentDate = that.getCurrentDate(weatherData.weather_data[0].date);
      var currentDiscription = weatherData.weather_data[0].weather;
      var currentWind = weatherData.weather_data[0].wind;
      var pm25 = weatherData.pm25;
      var airClass = that.getAirClass(weatherData.pm25);
      var airColor = that.getAirColor(weatherData.pm25);

      var weatherArray = weatherData.weather_data;
      var forecastArray = weatherArray.slice(1, );
      // 用for loop修改array里面object的value(例如"20~10℃"修改为"10-20℃")
      var i;
      for (i = 0; i < forecastArray.length; i++) {
        var correctTemperature = that.reverseTemperature(forecastArray[i].temperature);
        var weatherIconDay = that.getWeatherIconDay(forecastArray[i].weather);
        var weatherIconNight = that.getWeatherIconNight(forecastArray[i].weather);
        forecastArray[i].temperature = correctTemperature;
        forecastArray[i].dayPictureUrl = weatherIconDay;
        forecastArray[i].nightPictureUrl = weatherIconNight;
      }

      //重新排列array里面Object的顺序
      var array = weatherData.index;
      var arrayA = array.slice(0, 1);
      var arrayB = array.slice(1, );
      var arrayC = arrayB.reverse();
      //合并两个array为一个array
      var livingIndexArray = arrayA.concat(arrayC);

      //修改array里面object的value(例如"紫外线强度"改成"紫外线：")
      livingIndexArray[0].title = "穿衣：";
      livingIndexArray[1].title = "紫外线：";
      livingIndexArray[2].title = "运动：";
      livingIndexArray[3].title = "感冒：";
      livingIndexArray[4].title = "洗车：";
      // console.log(livingIndexArray)

      that.setData({
        currentDate: currentDate,
        currentWeatherIconDay: currentWeatherIconDay,
        currentWeatherIconNight: currentWeatherIconNight,
        currentTemperature: currentTemperature,
        currentDescription: currentDiscription,
        currentWind: currentWind,
        pm25: pm25,
        airClass: airClass,
        airColor: airColor,
        forecastArray: forecastArray,
        livingIndexArray: livingIndexArray,
      })
    }

    // 发起weather请求 
    BMap.weather({
      fail: fail,
      success: weatherSuccess
    });
  },

  // 转化温度格式，例如20~10℃转为10-20℃
  reverseTemperature(temperature) {
    var low;
    var high;
    var result;
    var index = temperature.indexOf("~");
    var length = temperature.length;

    low = temperature.substring(index + 2, length - 1);
    high = temperature.substring(0, index - 1);
    result = low + " - " + high + "℃";
    return result;
  },

  //获取今天日期
  getCurrentDate(date) {
    var index = date.indexOf("(")
    var todayDate
    todayDate = date.substring(0, index - 1);
    return todayDate;
  },

  //获取空气等级
  getAirClass(pm25) {
    var airClass = "";

    if (pm25 <= 50) {
      airClass = "优";
    } else if (pm25 > 50 && pm25 <= 100) {
      airClass = "良";
    } else if (pm25 > 100 && pm25 <= 150) {
      airClass = "轻度污染";
    } else if (pm25 > 150 && pm25 <= 200) {
      airClass = "中度污染";
    } else if (pm25 > 200 && pm25 <= 300) {
      airClass = "重度污染";
    } else {
      airClass = "严重污染";
    }
    // airClass="优"
    return airClass;
  },

  // 获取空气颜色
  getAirColor(pm25) {
    var airColor = "";

    if (pm25 <= 50) {
      airColor = "#009966";
    } else if (pm25 > 50 && pm25 <= 100) {
      airColor = "#ffde33";
    } else if (pm25 > 100 && pm25 <= 150) {
      airColor = "#ff9933";
    } else if (pm25 > 150 && pm25 <= 200) {
      airColor = "#cc0033";
    } else if (pm25 > 200 && pm25 <= 300) {
      airColor = "#660099";
    } else {
      airColor = "#7e0023";
    }
    // airColor ="#7e0023"
    return airColor;
  },

  //获取PM25详细信息
  pmTap() {
    console.log("成功")
    wx.showModal({
      title: '代码中',
      content: '敬请期待',
    })
  },

  //获取白天天气图标
  getWeatherIconDay: function(description) {
    var condition = String(description);
    var conditionDay = String(description);
    var url = "";

    if (condition.includes("转")) {
      conditionDay = condition.substring(0, condition.indexOf("转"));
      // console.log(conditionDay);

      if (conditionDay == "晴") {
        url = "/images/01-sunny.svg";
      } else if (conditionDay == "多云") {
        url = "/images/02-duoyun.svg";
      } else if (conditionDay == "阴") {
        url = "/images/03-yin.svg";
      } else if (conditionDay == "阵雨") {
        url = "/images/04-zhenyu.svg";
      } else if (conditionDay == "雷阵雨") {
        url = "/images/05-leizhenyu.svg";
      } else if (conditionDay == "雷阵雨伴有冰雹") {
        url = "/images/06-leizhenyubingbao";
      } else if (conditionDay == "雨夹雪") {
        url = "/images/07-yujiaxue.svg";
      } else if (conditionDay == "小雨") {
        url = "/images/08-xiaoyu.svg";
      } else if (conditionDay == "中雨") {
        url = "/images/09-zhongyu.svg";
      } else if (conditionDay == "大雨") {
        url = "/images/10-dayu.svg";
      } else if (conditionDay == "暴雨") {
        url = "/images/11-baoyu.svg";
      } else if (conditionDay == "大暴雨") {
        url = "/images/12-dabaoyu.svg";
      } else if (conditionDay == "特大暴雨") {
        url = "/images/13-tedabaoyu.svg";
      } else if (conditionDay == "阵雪") {
        url = "/images/14-zhenxue.svg";
      } else if (conditionDay == "小雪") {
        url = "/images/15-xiaoxue.svg";
      } else if (conditionDay == "中雪") {
        url = "/images/16-zhongxue.svg";
      } else if (conditionDay == "大雪") {
        url = "/images/17-daxue.svg";
      } else if (conditionDay == "暴雪") {
        url = "/images/18-baoxue.svg";
      } else if (conditionDay == "雾") {
        url = "/images/19-wu.svg";
      } else if (conditionDay == "冻雨") {
        url = "/images/20-dongyu.svg";
      } else if (conditionDay == "沙尘暴") {
        url = "/images/21-shachenbao.svg";
      } else if (conditionDay == "浮尘") {
        url = "/images/30-fuchen.svg";
      } else if (conditionDay == "扬沙") {
        url = "/images/31-yangsha.svg";
      } else if (conditionDay == "强沙尘暴") {
        url = "/images/32-qiangshachenbao.svg";
      } else if (conditionDay == "霾") {
        url = "/images/33-mai.svg";
      } else {
        url = "/images/unknow.svg";
      }

    }

    // not include 转
    else {
      // console.log(condition);

      if (condition == "晴") {
        url = "/images/01-sunny.svg";
      } else if (condition == "多云") {
        url = "/images/02-duoyun.svg";
      } else if (condition == "阴") {
        url = "/images/03-yin.svg";
      } else if (condition == "阵雨") {
        url = "/images/04-zhenyu.svg";
      } else if (condition == "雷阵雨") {
        url = "/images/05-leizhenyu.svg";
      } else if (condition == "雷阵雨伴有冰雹") {
        url = "/images/06-leizhenyubingbao";
      } else if (condition == "雨夹雪") {
        url = "/images/07-yujiaxue.svg";
      } else if (condition == "小雨") {
        url = "/images/08-xiaoyu.svg";
      } else if (condition == "中雨") {
        url = "/images/09-zhongyu.svg";
      } else if (condition == "大雨") {
        url = "/images/10-dayu.svg";
      } else if (condition == "暴雨") {
        url = "/images/11-baoyu.svg";
      } else if (condition == "大暴雨") {
        url = "/images/12-dabaoyu.svg";
      } else if (condition == "特大暴雨") {
        url = "/images/13-tedabaoyu.svg";
      } else if (condition == "阵雪") {
        url = "/images/14-zhenxue.svg";
      } else if (condition == "小雪") {
        url = "/images/15-xiaoxue.svg";
      } else if (condition == "中雪") {
        url = "/images/16-zhongxue.svg";
      } else if (condition == "大雪") {
        url = "/images/17-daxue.svg";
      } else if (condition == "暴雪") {
        url = "/images/18-baoxue.svg";
      } else if (condition == "雾") {
        url = "/images/19-wu.svg";
      } else if (condition == "冻雨") {
        url = "/images/20-dongyu.svg";
      } else if (condition == "沙尘暴") {
        url = "/images/21-shachenbao.svg";
      } else if (condition == "浮尘") {
        url = "/images/30-fuchen.svg";
      } else if (condition == "扬沙") {
        url = "/images/31-yangsha.svg";
      } else if (condition == "强沙尘暴") {
        url = "/images/32-qiangshachenbao.svg";
      } else if (condition == "霾") {
        url = "/images/33-mai.svg";
      } else {
        url = "/images/unknow.svg";
      }
    }
    return url;
  },

  //获取晚上天气图标
  getWeatherIconNight: function(description) {
    var condition = String(description);
    var conditionNight = String(description);
    var url = "";

    if (condition.includes("转")) {
      conditionNight = condition.substring(condition.indexOf("转") + 1, condition.length);
      // console.log(conditionNight);

      if (conditionNight == "晴") {
        url = "/images/34-clearnight.svg";
      } else if (conditionNight == "多云") {
        url = "/images/35-duoyunnight.svg";
      } else if (conditionNight == "阴") {
        url = "/images/36-yinnight.svg";
      } else if (conditionNight == "阵雨") {
        url = "/images/37-zhenyunight.svg";
      } else if (conditionNight == "雷阵雨") {
        url = "/images/05-leizhenyu.svg";
      } else if (conditionNight == "雷阵雨伴有冰雹") {
        url = "/images/06-leizhenyubingbao";
      } else if (conditionNight == "雨夹雪") {
        url = "/images/07-yujiaxue.svg";
      } else if (conditionNight == "小雨") {
        url = "/images/08-xiaoyu.svg";
      } else if (conditionNight == "中雨") {
        url = "/images/09-zhongyu.svg";
      } else if (conditionNight == "大雨") {
        url = "/images/10-dayu.svg";
      } else if (conditionNight == "暴雨") {
        url = "/images/11-baoyu.svg";
      } else if (conditionNight == "大暴雨") {
        url = "/images/12-dabaoyu.svg";
      } else if (conditionNight == "特大暴雨") {
        url = "/images/13-tedabaoyu.svg";
      } else if (conditionNight == "阵雪") {
        url = "/images/38-zhenxuenight.svg";
      } else if (conditionNight == "小雪") {
        url = "/images/15-xiaoxue.svg";
      } else if (conditionNight == "中雪") {
        url = "/images/16-zhongxue.svg";
      } else if (conditionNight == "大雪") {
        url = "/images/17-daxue.svg";
      } else if (conditionNight == "暴雪") {
        url = "/images/18-baoxue.svg";
      } else if (conditionNight == "雾") {
        url = "/images/19-wu.svg";
      } else if (conditionNight == "冻雨") {
        url = "/images/20-dongyu.svg";
      } else if (conditionNight == "沙尘暴") {
        url = "/images/21-shachenbao.svg";
      } else if (conditionNight == "浮尘") {
        url = "/images/30-fuchen.svg";
      } else if (conditionNight == "扬沙") {
        url = "/images/31-yangsha.svg";
      } else if (conditionNight == "强沙尘暴") {
        url = "/images/32-qiangshachenbao.svg";
      } else if (conditionNight == "霾") {
        url = "/images/33-mai.svg";
      } else {
        url = "/images/unknow.svg";
      }
    }

    // not include 转
    else {
      // console.log(condition);

      if (condition == "晴") {
        url = "/images/34-clearnight.svg";
      } else if (condition == "多云") {
        url = "/images/35-duoyunnight.svg";
      } else if (condition == "阴") {
        url = "/images/36-yinnight.svg";
      } else if (condition == "阵雨") {
        url = "/images/37-zhenyunight.svg";
      } else if (condition == "雷阵雨") {
        url = "/images/05-leizhenyu.svg";
      } else if (condition == "雷阵雨伴有冰雹") {
        url = "/images/06-leizhenyubingbao";
      } else if (condition == "雨夹雪") {
        url = "/images/07-yujiaxue.svg";
      } else if (condition == "小雨") {
        url = "/images/08-xiaoyu.svg";
      } else if (condition == "中雨") {
        url = "/images/09-zhongyu.svg";
      } else if (condition == "大雨") {
        url = "/images/10-dayu.svg";
      } else if (condition == "暴雨") {
        url = "/images/11-baoyu.svg";
      } else if (condition == "大暴雨") {
        url = "/images/12-dabaoyu.svg";
      } else if (condition == "特大暴雨") {
        url = "/images/13-tedabaoyu.svg";
      } else if (condition == "阵雪") {
        url = "/images/38-zhenxuenight.svg";
      } else if (condition == "小雪") {
        url = "/images/15-xiaoxue.svg";
      } else if (condition == "中雪") {
        url = "/images/16-zhongxue.svg";
      } else if (condition == "大雪") {
        url = "/images/17-daxue.svg";
      } else if (condition == "暴雪") {
        url = "/images/18-baoxue.svg";
      } else if (condition == "雾") {
        url = "/images/19-wu.svg";
      } else if (condition == "冻雨") {
        url = "/images/20-dongyu.svg";
      } else if (condition == "沙尘暴") {
        url = "/images/21-shachenbao.svg";
      } else if (condition == "浮尘") {
        url = "/images/30-fuchen.svg";
      } else if (condition == "扬沙") {
        url = "/images/31-yangsha.svg";
      } else if (condition == "强沙尘暴") {
        url = "/images/32-qiangshachenbao.svg";
      } else if (condition == "霾") {
        url = "/images/33-mai.svg";
      } else {
        url = "/images/unknow.svg";
      }
    }

    return url;
  },

})