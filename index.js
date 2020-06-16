// 引用百度地图微信小程序JSAPI模块 
var bmap = require('../../libs/bmap-wx.js');

Page({

  data: {
    scrollHeight: 0,
    location: 'Loading...',
  },

  onLoad: function() {
    this.calculateScrollHeight();
    this.getLocation();
  },

  // 计算滚动区域的高度
  calculateScrollHeight() {
    let windowHeight = wx.getSystemInfoSync().windowHeight
    let windowWidth = wx.getSystemInfoSync().windowWidth
    // console.log(windowHeight);
    // console.log(windowWidth);

    // 小程序任何机型的宽都是750rpx，但windowHeight和windowWidth都是px为单位，故需要转换
    let scrollHeight = windowHeight * 750 / windowWidth
    // console.log(scrollHeight)
    this.setData({
      scrollHeight: scrollHeight,
    });
  },

  // 获取地图数据并设置位置
  getLocation() {
    var that = this;
    // 新建百度地图对象 
    var BMap = new bmap.BMapWX({
      ak: 'zVcyq32e7P7ouGaTIExV7wff2KhkCZOD'
    });

    var fail = function(data) {
      console.log(data)
    };

    var mapSuccess = function(data) {
      // console.log(data)
      var mapData = data.originalData.result.addressComponent;
      var location = mapData.city + ' ' + mapData.district;
      var longitude = data.originalData.result.location.lng;
      var latitude = data.originalData.result.location.lat;
      var jingWeiDu = latitude + ":" + longitude;
      that.getForecast15Array(jingWeiDu);

      that.setData({
        location: location,
      })
    };

    // 发起regeocoding检索请求
    BMap.regeocoding({
      fail: fail,
      success: mapSuccess,
    });
  },

  // 获取昨天和未来15天天气
  getForecast15Array(jingWeiDu) {
    var that = this;
    wx.request({
      // 从其他地方传递过来的变量用'+ +'包起来
      url: 'https://api.seniverse.com/v3/weather/daily.json?key=StZ9WiTb0wgA81Kkq&location=' + jingWeiDu + '&language=zh-Hans&unit=c&start=-1&days=16',
      data: {
        x: '',
        y: ''
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        // console.log(res.data)
        var forecast15Array = res.data.results[0].daily;
        that.setForecast15Array(forecast15Array);
        that.getLivingIndex(jingWeiDu);
      }
    })
  },

  // 设置昨天和未来15天天气
  setForecast15Array(forecast15Array) {
    var that = this;
    // console.log(forecast15Array)

    var i;
    for (i = 0; i < forecast15Array.length; i++) {
      //计算日期对应星期几
      var date = forecast15Array[i].date;
      var weekday = that.getWeekday(date);
      forecast15Array[1].weekday = '今天';
      forecast15Array[i].weekday = weekday;

      //计算精简格式的日期
      var shortDate = that.getShortDate(date);
      forecast15Array[i].shortDate = shortDate;

      //计算每天的天气图标
      var dailyTextDay = forecast15Array[i].text_day;
      var dailyTextNight = forecast15Array[i].text_night;
      var dailyIconDay = that.getWeatherIconDay(dailyTextDay);
      var dailyIconNight = that.getWeatherIconNight(dailyTextNight);
      forecast15Array[i].iconDay = dailyIconDay;
      forecast15Array[i].iconNight = dailyIconNight;

      //计算风向和等级
      var windDirection = forecast15Array[i].wind_direction;
      if (windDirection == '无持续风向') {
        windDirection = '不定';
      } else {
        windDirection = windDirection + '风';
      }
      forecast15Array[i].wind_direction = windDirection;
      var windScale = forecast15Array[i].wind_scale + '级';
      forecast15Array[i].wind_scale = windScale;

      //计算今天的天气信息
      var todayWeekday = that.getWeekday(forecast15Array[1].date);
      var todayDate = that.getTodayDate(forecast15Array[1].date);
      var todayDateInfo = '今天 ' + todayWeekday + ' ' + todayDate;
      var todayIconDay = forecast15Array[1].iconDay;
      var todayIconNight = forecast15Array[1].iconNight;
      var low = forecast15Array[1].low;
      var high = forecast15Array[1].high;
      var todayTemperature = low + " - " + high + "℃";
      var textDay = forecast15Array[1].text_day;
      var textNight = forecast15Array[1].text_night;
      var todayWeather = that.getTodayWeather(textDay, textNight);
      var todayWind = forecast15Array[1].wind_direction + forecast15Array[1].wind_scale;

      //处理凌晨00:00后获取的数据是未知
      if (forecast15Array[15].text_day == "未知") {
        forecast15Array[15].text_day = forecast15Array[14].text_day;
        forecast15Array[15].text_night = forecast15Array[14].text_night;
        forecast15Array[15].high = forecast15Array[14].high;
        forecast15Array[15].low = forecast15Array[14].low;
        forecast15Array[15].wind_direction = forecast15Array[14].wind_direction;
        forecast15Array[15].wind_scale = forecast15Array[14].wind_scale;
      }
    }

    that.setData({
      todayDateInfo: todayDateInfo,
      todayIconDay: todayIconDay,
      todayIconNight: todayIconNight,
      todayTemperature: todayTemperature,
      todayWeather: todayWeather,
      todayWind: todayWind,
      forecast15Array: forecast15Array
    })
  },

  // 获取生活指数
  getLivingIndex(jingWeiDu) {
    var that = this;
    wx.request({
      url: 'https://api.seniverse.com/v3/life/suggestion.json?key=StZ9WiTb0wgA81Kkq&location=' + jingWeiDu + '&language=zh-Hans',
      data: {
        x: '',
        y: ''
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        // console.log(res.data)
        var livingIndex = res.data.results[0].suggestion;
        that.setLivingIndex(livingIndex);
        that.getHourlyWeather(jingWeiDu);
      }
    })
  },

  //设置生活指数
  setLivingIndex(livingIndex) {
    var that = this;
    // console.log(livingIndex)
    var livingIndexArray = [];
    livingIndexArray.push(livingIndex.dressing);
    livingIndexArray.push(livingIndex.uv);
    livingIndexArray.push(livingIndex.sport);
    livingIndexArray.push(livingIndex.flu);
    livingIndexArray.push(livingIndex.car_washing);
    livingIndexArray[0].icon = "/images/dressing.svg";
    livingIndexArray[1].icon = "/images/uv.svg";
    livingIndexArray[2].icon = "/images/sports.svg";
    livingIndexArray[3].icon = "/images/flu.svg";
    livingIndexArray[4].icon = "/images/carwash.svg";
    livingIndexArray[0].title = "穿衣";
    livingIndexArray[1].title = "紫外线";
    livingIndexArray[2].title = "运动";
    livingIndexArray[3].title = "感冒";
    livingIndexArray[4].title = "洗车";

    // console.log(livingIndexArray)

    that.setData({
      livingIndexArray: livingIndexArray,
    })
  },

  // 获取24小时天气预报
  getHourlyWeather(jingWeiDu) {
    var that = this;

    wx.request({
      url: 'https://api.seniverse.com/v3/weather/hourly.json?key=StZ9WiTb0wgA81Kkq&location=' + jingWeiDu + '&language=zh-Hans&unit=c&start=0&hours=24',
      data: {
        x: '',
        y: ''
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        // console.log(res.data)
        var hourlyWeather = res.data.results[0].hourly;
        console.log(res.data.results[0])
        that.setHourlyWeather(hourlyWeather);
        that.getAirQuality(jingWeiDu);
      }
    })
  },

  //设置24小时天气预报
  setHourlyWeather(hourlyWeather) {
    // console.log(hourlyWeather)
    var that = this;

    var i;
    for (i = 0; i < hourlyWeather.length; i++) {
      //计算精简格式的时间
      var hourlyWeatherTime = hourlyWeather[i].time;
      var shortHourlyTime = that.getShortHourlyTime(hourlyWeatherTime);
      hourlyWeather[0].time = "现在";
      hourlyWeather[i].time = shortHourlyTime;

      //计算天气图标
      var hourlyWeatherText = hourlyWeather[i].text;
      var hourlyWeatherIcon;
      if (shortHourlyTime > 6 && shortHourlyTime < 18) {
        hourlyWeatherIcon = that.getWeatherIconDay(hourlyWeatherText);
      } else {
        hourlyWeatherIcon = that.getWeatherIconNight(hourlyWeatherText);
      }
      hourlyWeather[i].weatherIcon = hourlyWeatherIcon;
    }

    that.setData({
      hourlyWeather: hourlyWeather,
    })
  },

  // 获取逐日空气质量预报
  getAirQuality(jingWeiDu) {
    var that = this;
    wx.request({
      url: 'https://api.seniverse.com/v3/air/daily.json?key=StZ9WiTb0wgA81Kkq&language=zh-Hans&location=' + jingWeiDu + '',
      data: {
        x: '',
        y: ''
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        // console.log(res.data)
        var airArray = res.data.results[0].daily;
        // console.log(airArray)

        // //每次打开会从api获取今天和未来四天的空气质量，如下：
        // airArray = [{
        //   date: '2020-06-16',
        //   aqi: "50"
        // }, {
        //   date: '2020-06-17',
        //   aqi: "150"
        // }, {
        //   date: '2020-06-18',
        //   aqi: "200"
        // }, {
        //   date: '2020-06-19',
        //   aqi: "250"
        // }, {
        //   date: '2020-06-20',
        //   aqi: "300"
        // }]

        var airA;
        var airB = wx.getStorageSync('airB');
        // console.log(airB)

        // 如果用户没有昨天的缓存，用今天数据替代，同时缓存起来
        if (airB == false) {
          airA = airArray[0]
          airB = wx.setStorageSync('airB', airArray[0])
          console.log('没有缓存，第一次保存')
        }
        //如果用户有缓存
        else {
          //如果日期不一样
          if (airB.date != airArray[0].date) {
            airA = airB;
            airB = wx.setStorageSync('airB', airArray[0])
            console.log('有缓存，新的一天，刷新数据')
          }
          // 如果日期一样
          else {
            airA = wx.getStorageSync('airB')
            airB = wx.setStorageSync('airB', airArray[0])
            console.log('有缓存，同一天，不刷新数据')
          }
        }

        airArray.unshift(airA)
        console.log(airArray)

        var i;
        for (i = 0; i < airArray.length; i++) {
          var aqi = airArray[i].aqi;
          var air = that.getAir(aqi);
          airArray[i].airColor = air[0];
          airArray[i].airText = air[1];
        }

        var todayAirColor = airArray[1].airColor;
        var todayAirAqi = airArray[1].aqi;
        var todayAirQuality = airArray[1].airText;

        that.setData({
          todayAirColor,
          todayAirAqi,
          todayAirQuality,
          airArray
        })
      }
    })
  },

  //获取空气质量颜色
  getAir(aqi) {
    var airColor = '';
    var airText = '';

    if (aqi <= 50) {
      airColor = "#009966";
      airText = "优";
    } else if (aqi > 50 && aqi <= 100) {
      airColor = "#edc444";
      airText = "良";
    } else if (aqi > 100 && aqi <= 150) {
      airColor = "#ff9933";
      airText = "轻度";
    } else if (aqi > 150 && aqi <= 200) {
      airColor = "#cc0033";
      airText = "中度";
    } else if (aqi > 200 && aqi <= 300) {
      airColor = "#660099";
      airText = "重度";
    } else {
      airColor = "#7e0023";
      airText = "严重";
    }

    var air = [airColor, airText];
    return air
  },

  //获取今天日期
  getTodayDate(date) {
    var index = date.indexOf("-")
    var todayDate1 = date.substring(index + 1, index + 3);
    var todayDate2 = date.substring(index + 4);
    var todayDate = todayDate1 + "月" + todayDate2 + "日";
    return todayDate;
  },

  //获取今天天气文字描述
  getTodayWeather(textDay, textNight) {
    var todayWeather;
    if (textDay == textNight) {
      todayWeather = textDay
    } else {
      todayWeather = textDay + '转' + textNight
    }
    return todayWeather
  },

  //获取24小时预报精简格式的时间
  getShortHourlyTime(hourlyWeatherTime) {
    var index = hourlyWeatherTime.indexOf("T")
    var shortHourlyTime = hourlyWeatherTime.substring(index + 1, index + 3);
    return shortHourlyTime;
  },

  //Javascript new Date()和getDay()获取15天预报日期对应星期几
  getWeekday(date) {
    var currentDate = new Date(date);
    // console.log(currentDate)
    var index = currentDate.getDay();
    // console.log(index)
    var weekdayArray = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
    var weekday = weekdayArray[index]
    // console.log(weekday)
    return weekday;
  },

  // 获取15天预报精简格式的日期
  getShortDate(date) {
    var index = date.indexOf("-")
    var shortDate1 = date.substring(index + 1, index + 3);
    var shortDate2 = date.substring(index + 4);
    var shortDate = shortDate1 + "/" + shortDate2;
    return shortDate;
  },

  //获取白天天气图标
  getWeatherIconDay: function(description) {
    var condition = String(description);
    var conditionDay = "";
    var weatherIconDay = "";

    if (condition.includes("转")) {
      conditionDay = condition.substring(0, condition.indexOf("转"));

    } else {
      conditionDay = condition;
    }

    if (conditionDay == "晴") {
      weatherIconDay = "/images/01-sunny.svg";
    } else if (conditionDay == "多云") {
      weatherIconDay = "/images/02-duoyun.svg";
    } else if (conditionDay == "阴") {
      weatherIconDay = "/images/03-yin.svg";
    } else if (conditionDay == "阵雨") {
      weatherIconDay = "/images/04-zhenyu.svg";
    } else if (conditionDay == "雷阵雨") {
      weatherIconDay = "/images/05-leizhenyu.svg";
    } else if (conditionDay == "雷阵雨伴有冰雹") {
      weatherIconDay = "/images/06-leizhenyubingbao";
    } else if (conditionDay == "雨夹雪") {
      weatherIconDay = "/images/07-yujiaxue.svg";
    } else if (conditionDay == "小雨") {
      weatherIconDay = "/images/08-xiaoyu.svg";
    } else if (conditionDay == "中雨") {
      weatherIconDay = "/images/09-zhongyu.svg";
    } else if (conditionDay == "大雨") {
      weatherIconDay = "/images/10-dayu.svg";
    } else if (conditionDay == "暴雨") {
      weatherIconDay = "/images/11-baoyu.svg";
    } else if (conditionDay == "大暴雨") {
      weatherIconDay = "/images/12-dabaoyu.svg";
    } else if (conditionDay == "特大暴雨") {
      weatherIconDay = "/images/13-tedabaoyu.svg";
    } else if (conditionDay == "阵雪") {
      weatherIconDay = "/images/14-zhenxue.svg";
    } else if (conditionDay == "小雪") {
      weatherIconDay = "/images/15-xiaoxue.svg";
    } else if (conditionDay == "中雪") {
      weatherIconDay = "/images/16-zhongxue.svg";
    } else if (conditionDay == "大雪") {
      weatherIconDay = "/images/17-daxue.svg";
    } else if (conditionDay == "暴雪") {
      weatherIconDay = "/images/18-baoxue.svg";
    } else if (conditionDay == "雾") {
      weatherIconDay = "/images/19-wu.svg";
    } else if (conditionDay == "冻雨") {
      weatherIconDay = "/images/20-dongyu.svg";
    } else if (conditionDay == "沙尘暴") {
      weatherIconDay = "/images/21-shachenbao.svg";
    } else if (conditionDay == "浮尘") {
      weatherIconDay = "/images/30-fuchen.svg";
    } else if (conditionDay == "扬沙") {
      weatherIconDay = "/images/31-yangsha.svg";
    } else if (conditionDay == "强沙尘暴") {
      weatherIconDay = "/images/32-qiangshachenbao.svg";
    } else if (conditionDay == "霾") {
      weatherIconDay = "/images/33-mai.svg";
    } else {
      weatherIconDay = "/images/unknown.svg";
    }

    return weatherIconDay;
  },

  //获取晚上天气图标
  getWeatherIconNight: function(description) {
    var condition = String(description);
    var conditionNight = "";
    var weatherIconNight = "";

    if (condition.includes("转")) {
      conditionNight = condition.substring(condition.indexOf("转") + 1, condition.length);
    } else {
      conditionNight = condition;
    }

    if (conditionNight == "晴") {
      weatherIconNight = "/images/34-clearnight.svg";
    } else if (conditionNight == "多云") {
      weatherIconNight = "/images/35-duoyunnight.svg";
    } else if (conditionNight == "阴") {
      weatherIconNight = "/images/36-yinnight.svg";
    } else if (conditionNight == "阵雨") {
      weatherIconNight = "/images/37-zhenyunight.svg";
    } else if (conditionNight == "雷阵雨") {
      weatherIconNight = "/images/05-leizhenyu.svg";
    } else if (conditionNight == "雷阵雨伴有冰雹") {
      weatherIconNight = "/images/06-leizhenyubingbao";
    } else if (conditionNight == "雨夹雪") {
      weatherIconNight = "/images/07-yujiaxue.svg";
    } else if (conditionNight == "小雨") {
      weatherIconNight = "/images/08-xiaoyu.svg";
    } else if (conditionNight == "中雨") {
      weatherIconNight = "/images/09-zhongyu.svg";
    } else if (conditionNight == "大雨") {
      weatherIconNight = "/images/10-dayu.svg";
    } else if (conditionNight == "暴雨") {
      weatherIconNight = "/images/11-baoyu.svg";
    } else if (conditionNight == "大暴雨") {
      weatherIconNight = "/images/12-dabaoyu.svg";
    } else if (conditionNight == "特大暴雨") {
      weatherIconNight = "/images/13-tedabaoyu.svg";
    } else if (conditionNight == "阵雪") {
      weatherIconNight = "/images/38-zhenxuenight.svg";
    } else if (conditionNight == "小雪") {
      weatherIconNight = "/images/15-xiaoxue.svg";
    } else if (conditionNight == "中雪") {
      weatherIconNight = "/images/16-zhongxue.svg";
    } else if (conditionNight == "大雪") {
      weatherIconNight = "/images/17-daxue.svg";
    } else if (conditionNight == "暴雪") {
      weatherIconNight = "/images/18-baoxue.svg";
    } else if (conditionNight == "雾") {
      weatherIconNight = "/images/19-wu.svg";
    } else if (conditionNight == "冻雨") {
      weatherIconNight = "/images/20-dongyu.svg";
    } else if (conditionNight == "沙尘暴") {
      weatherIconNight = "/images/21-shachenbao.svg";
    } else if (conditionNight == "浮尘") {
      weatherIconNight = "/images/30-fuchen.svg";
    } else if (conditionNight == "扬沙") {
      weatherIconNight = "/images/31-yangsha.svg";
    } else if (conditionNight == "强沙尘暴") {
      weatherIconNight = "/images/32-qiangshachenbao.svg";
    } else if (conditionNight == "霾") {
      weatherIconNight = "/images/33-mai.svg";
    } else {
      weatherIconNight = "/images/unknown.svg";
    }

    return weatherIconNight;
  },

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

  //获取PM25详细信息
  airTap() {
    wx.showModal({
      title: '代码中',
      content: '敬请期待',
    })
  },

})