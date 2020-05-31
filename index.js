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

    var that = this;

    // 新建百度地图对象 
    var BMap = new bmap.BMapWX({
      ak: 'zVcyq32e7P7ouGaTIExV7wff2KhkCZOD'
    });

    var fail = function(data) {
      console.log(data)
    };

    // 获取地图数据
    var mapSuccess = function(data) {
      console.log(data)
      var mapData = data.originalData.result.addressComponent;
      var location = mapData.city + ' ' + mapData.district;

      that.setData({
        location: location,
      })
    }

    // 获取天气数据
    var weatherSuccess = function(data) {
      console.log(data)
      var weatherData = data.originalData.results[0];

      that.setData({
        // location: weatherData.currentCity,
        currentTemperature: that.reverseTemperature(weatherData.weather_data[0].temperature),
        description: weatherData.weather_data[0].weather,
        wind: weatherData.weather_data[0].wind,
        pm25: weatherData.pm25,
        airClass: that.getAirClass(weatherData.pm25),
        airColor: that.getAirColor(weatherData.pm25),
        weatherIconDay: that.getWeatherIconDay(weatherData.weather_data[0].weather),
        weatherIconNight: that.getWeatherIconNight(weatherData.weather_data[0].weather),
        clothesWearing: weatherData.index[0].des,
        uvIndex: weatherData.index[4].des,
        exerciseIndex: weatherData.index[3].des,
        fluIndex: weatherData.index[2].des,
        carWashing: weatherData.index[1].des,
        weatherDate0: that.getWeatherDate(weatherData.weather_data[0].date),
        weatherDate1: weatherData.weather_data[1].date,
        weatherIcon1Day: that.getWeatherIconDay(weatherData.weather_data[1].weather),
        weatherIcon1Night: that.getWeatherIconNight(weatherData.weather_data[1].weather),
        description1: weatherData.weather_data[1].weather,
        temperature1: that.reverseTemperature(weatherData.weather_data[1].temperature),
        weatherDate2: weatherData.weather_data[2].date,
        weatherIcon2Day: that.getWeatherIconDay(weatherData.weather_data[2].weather),
        weatherIcon2Night: that.getWeatherIconNight(weatherData.weather_data[2].weather),
        description2: weatherData.weather_data[2].weather,
        temperature2: that.reverseTemperature(weatherData.weather_data[2].temperature),
        weatherDate3: weatherData.weather_data[3].date,
        weatherIcon3Day: that.getWeatherIconDay(weatherData.weather_data[3].weather),
        weatherIcon3Night: that.getWeatherIconNight(weatherData.weather_data[3].weather),
        description3: weatherData.weather_data[3].weather,
        temperature3: that.reverseTemperature(weatherData.weather_data[3].temperature),
      });
    }

    // 发起weather请求 
    BMap.weather({
      fail: fail,
      success: weatherSuccess
    });

    // 发起regeocoding检索请求 
    BMap.regeocoding({
      fail: fail,
      success: mapSuccess,
    });

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
  getWeatherDate(date) {
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