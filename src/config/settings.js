import { alignmentIcons, layoutIcons } from './icons'

// 字体大小选项
export const fontSizes = [6, 7, 8, 9, 10, 11, 12, 14, 16, 18, 21, 24, 30, 36, 42, 48, 54, 60, 66, 72, 78, 84, 96, 108, 120, 132, 144, 156, 168, 180, 192, 204, 216, 228, 240, 264, 288, 312]

// 获取字体大小, step: 步长
// 1: 加大字体, 也可以为其他正数
// -1: 减小字体
export const getFontSizeByStep = (fontSize, step) => {
  const index = fontSizes.indexOf(fontSize)
  const newIndex = index + step
  if (newIndex >= 0 && newIndex < fontSizes.length) {
    return fontSizes[newIndex]
  }
  return fontSize
}

// 水平对齐方式选项
export const originXOptions = [
  { value: 'left', label: '左对齐', icon: alignmentIcons.left },
  { value: 'center', label: '居中', icon: alignmentIcons.center },
  { value: 'right', label: '右对齐', icon: alignmentIcons.right }
]

// 垂直对齐方式选项
export const originYOptions = [
  { value: 'top', label: '向上', icon: alignmentIcons.top },
  { value: 'center', label: '居中', icon: alignmentIcons.middle },
  { value: 'bottom', label: '向下', icon: alignmentIcons.bottom }
]

// 时间格式选项
export const TimeFormatOptions = [
  { value: 0, label: 'HH:mm', example: '12:34' },
  { value: 1, label: 'HH:mm:ss', example: '12:34:56' }, // 例如: 12:34:56
  { value: 2, label: 'HH', example: '12' },
  { value: 3, label: 'mm', example: '34' },
  { value: 4, label: 'ss', example: '56' },
  { value: 5, label: 'HH:', example: '12:' },
  { value: 6, label: ':mm', example: ':34' },
  { value: 7, label: 'A', example: 'PM' }, // AM/PM/24H
  { value: 8, label: 'a', example: 'pm' } // am/pm/24h
]

// 日期格式选项
export const DateFormatOptions = [
  { value: 0, label: 'DD', example: '05' }, // 例如: 05
  { value: 1, label: 'ddd', example: 'Mon' }, // 例如: Mon
  { value: 2, label: 'dddd', example: 'Monday' }, // 星期几
  { value: 3, label: 'Do', example: '5th' }, // 例如: 5th
  { value: 4, label: 'MMM', example: 'Sep' }, // 例如: Sep
  { value: 5, label: 'MMMM', example: 'September' }, // 例如: September
  { value: 6, label: 'MMM D', example: 'Sep 5' }, // 例如: Sep 5
  { value: 7, label: 'MMMM D', example: 'September 5' }, // 例如: September 5
  // 涵盖星期、月份和日子等
  { value: 8, label: 'ddd DD', example: 'Mon 05' }, // 例如: Mon 05
  { value: 9, label: 'MMMM D, dddd', example: 'September 5, Monday' }, // 例如: September 5, Monday
  { value: 10, label: 'MMM D, dddd', example: 'Sep 5, Monday' }, // 例如: Sep 5, Monday
  { value: 11, label: 'MMMM, D dddd', example: 'September, 5 Monday' }, // 例如: September, 5 Monday
  { value: 12, label: 'dddd, MMMM D', example: 'Monday, September 5' }, // 例如: Monday, September 5

  // 带年份
  { value: 13, label: 'MMM D, YYYY', example: 'Sep 5, 2023' }, // 例如: Sep 5, 2023
  { value: 14, label: 'D MMM YYYY', example: '5 Sep 2023' }, // 例如: 5 Sep 2023
  { value: 15, label: 'DD.MM.YYYY', example: '05.09.2023' }, // 例如: 05.09.2023
  { value: 16, label: 'MM/DD/YYYY', example: '09/05/2023' }, // 例如: 09/05/2023
  { value: 17, label: 'YYYY-MM-DD', example: '2023-09-05' }, // 例如: 2023-09-05
  { value: 18, label: 'MMMM Do, YYYY', example: 'September 5th, 2023' }, // 例如: September 5th, 2023
  { value: 19, label: 'MMM D, YYYY, dddd', example: 'Sep 5, 2023, Monday' } // 例如: Sep 5, 2023, Monday
]

// 布局方式选项
export const LayoutOptions = [
  { value: ':LAYOUT_TYPES_CENTER', label: '水平居中', icon: layoutIcons[':LAYOUT_TYPES_CENTER'] },
  { value: ':LAYOUT_TYPES_LEFT', label: '水平向左', icon: layoutIcons[':LAYOUT_TYPES_LEFT'] },
  { value: ':LAYOUT_TYPES_RIGHT', label: '水平向右', icon: layoutIcons[':LAYOUT_TYPES_RIGHT'] }
]

// 标签长度类型枚举
export const LABEL_TYPE_DEFAULT = 0 // 图标
export const LABEL_TYPE_SMALL = 1 // 小号文字
export const LABEL_TYPE_MEDIUM = 2 // 中号文字
export const LABEL_TYPE_LONG = 3 // 长号文字

export const DataTypeOptions = [
  { label: '心率', metricSymbol: ':FIELD_TYPE_HEART_RATE', value: 0, defaultValue: '80', icon: '\u0030', enLabel: {
    short: 'HR',
    medium: 'Heart Rate',
    long: 'Heart Rate BPM'
  }},
  { label: '步数', metricSymbol: ':FIELD_TYPE_STEPS', value: 1, defaultValue: '1000', icon: '\u0031', enLabel: {
    short: 'Steps',
    medium: 'Steps Count',
    long: 'Total Steps Today'
  }},
  { label: '卡路里', metricSymbol: ':FIELD_TYPE_CALORIES', value: 2, defaultValue: '200', icon: '\u0032', enLabel: {
    short: 'Cal',
    medium: 'Calories',
    long: 'Calories Burned'
  }},
  { label: '爬楼', metricSymbol: ':FIELD_TYPE_FLOORS_CLIMBED', value: 3, defaultValue: '10', icon: '\u0033', enLabel: {
    short: 'Floors',
    medium: 'Floors Climbed',
    long: 'Total Floors Climbed'
  }},
  { label: '纬度', metricSymbol: ':FIELD_TYPE_ALTITUDE', value: 4, defaultValue: '0', icon: '\u0034', enLabel: {
    short: 'Alt',
    medium: 'Altitude',
    long: 'Current Altitude'
  }},
  { label: '距离', metricSymbol: ':FIELD_TYPE_DISTANCE', value: 5, defaultValue: '5', icon: '\u0045', enLabel: {
    short: 'Dist',
    medium: 'Distance',
    long: 'Total Distance'
  }},
  { label: '日出和日落 (废弃)', metricSymbol: ':FIELD_TYPE_SUN_RISE_SET', value: 6, defaultValue: '0', icon: '\u0021', enLabel: {
    short: 'Sun',
    medium: 'Sun Rise/Set',
    long: 'Sunrise and Sunset'
  }},
  { label: '日出', metricSymbol: ':FIELD_TYPE_SUN_RISE', value: 7, defaultValue: '6', icon: '\u0060', enLabel: {
    short: 'Rise',
    medium: 'Sunrise',
    long: 'Sunrise Time'
  }},
  { label: '日落', metricSymbol: ':FIELD_TYPE_SUN_SET', value: 8, defaultValue: '18', icon: '\u0061', enLabel: {
    short: 'Set',
    medium: 'Sunset',
    long: 'Sunset Time'
  }},
  { label: '设备电量', metricSymbol: ':FIELD_TYPE_BATTERY', value: 9, defaultValue: '100', icon: '\u0026', enLabel: {
    short: 'Batt',
    medium: 'Battery',
    long: 'Battery Level'
  }},
  { label: '每日活动时间', metricSymbol: ':FIELD_TYPE_DAYLY_ACTIVE_MINUTES', value: 10, defaultValue: '30', icon: '\u0044', enLabel: {
    short: 'Act Min',
    medium: 'Active Mins',
    long: 'Daily Active Minutes'
  }},
  { label: '每周活动时间', metricSymbol: ':FIELD_TYPE_WEEKLY_ACTIVE_MINUTES', value: 11, defaultValue: '150', icon: '\u0040', enLabel: {
    short: 'Wk Act',
    medium: 'Weekly Active',
    long: 'Weekly Active Minutes'
  }},
  { label: '周跑步距离', metricSymbol: ':FIELD_TYPE_WEEKLY_RUN_DISTANCE', value: 12, defaultValue: '10', icon: '\u0046', enLabel: {
    short: 'Run',
    medium: 'Run Distance',
    long: 'Weekly Run Distance'
  }},
  { label: '周骑行距离', metricSymbol: ':FIELD_TYPE_WEEKLY_CYCLING_DISTANCE', value: 13, defaultValue: '15', icon: '\u0047', enLabel: {
    short: 'Cycle',
    medium: 'Cycle Distance',
    long: 'Weekly Cycling Distance'
  }},
  { label: '恢复时间', metricSymbol: ':FIELD_TYPE_TIME_TO_RECOVERY', value: 14, defaultValue: '24', icon: '\u0041', enLabel: {
    short: 'Recovery',
    medium: 'Recovery Time',
    long: 'Time to Recovery'
  }},
  { label: '身体电量', metricSymbol: ':FIELD_TYPE_BODY_BATTERY', value: 15, defaultValue: '50', icon: '\u0035', enLabel: {
    short: 'Body',
    medium: 'Body Battery',
    long: 'Body Battery Level'
  }},
  { label: '血氧饱和度', metricSymbol: ':FIELD_TYPE_PULSE_OX', value: 16, defaultValue: '95', icon: '\u003b', enLabel: {
    short: 'SpO2',
    medium: 'Pulse Ox',
    long: 'Blood Oxygen Saturation'
  }},
  { label: '睡眠时间', metricSymbol: ':FIELD_TYPE_SLEEP_TIME', value: 17, defaultValue: '8', icon: '\u0021', enLabel: {
    short: 'Sleep',
    medium: 'Sleep Time',
    long: 'Total Sleep Hours'
  }},
  { label: '压力', metricSymbol: ':FIELD_TYPE_STRESS', value: 18, defaultValue: '0', icon: '\u0036', enLabel: {
    short: 'Stress',
    medium: 'Stress Level',
    long: 'Current Stress Level'
  }},
  { label: '通知', metricSymbol: ':FIELD_TYPE_NOTIFICATIONS', value: 19, defaultValue: '0', icon: '\u0025', enLabel: {
    short: 'Notif',
    medium: 'Notifications',
    long: 'Pending Notifications'
  }},
  { label: '闹钟', metricSymbol: ':FIELD_TYPE_ALARMS', value: 20, defaultValue: '0', icon: '\u0024', enLabel: {
    short: 'Alarm',
    medium: 'Alarms',
    long: 'Active Alarms'
  }},
  { label: '蓝牙连接状态', metricSymbol: ':INDICATOR_TYPE_BLUETOOTH', value: 21, defaultValue: '1', icon: '\u0022', enLabel: {
    short: 'BT',
    medium: 'Bluetooth',
    long: 'Bluetooth Connection'
  }},
  { label: '天气', metricSymbol: ':FIELD_TYPE_WEATHER', value: 30, defaultValue: '25°C', icon: '\uF000', enLabel: {
    short: 'Weather',
    medium: 'Weather Cond',
    long: 'Weather Condition'
  }},
  { label: '温度', metricSymbol: ':FIELD_TYPE_TEMPERATURE', value: 31, defaultValue: '25°C', icon: '\u0062', enLabel: {
    short: 'Temp',
    medium: 'Temperature',
    long: 'Current Temperature'
  }},
  { label: '体感温度', metricSymbol: ':FIELD_TYPE_FEELS_LIKE_TEMPERATURE', value: 32, defaultValue: '25°C', icon: '\u0021', enLabel: {
    short: 'Feels',
    medium: 'Feels Like',
    long: 'Feels Like Temperature'
  }},
  { label: '每天最高温度', metricSymbol: ':FIELD_TYPE_TEMPERATURE_HIGH', value: 41, defaultValue: '30°C', icon: '\u0021', enLabel: {
    short: 'High',
    medium: 'High Temp',
    long: 'Today\'s High Temp'
  }},
  { label: '每天最低温度', metricSymbol: ':FIELD_TYPE_TEMPERATURE_LOW', value: 42, defaultValue: '15°C', icon: '\u0021', enLabel: {
    short: 'Low',
    medium: 'Low Temp',
    long: 'Today\'s Low Temp'
  }},
  { label: '湿度', metricSymbol: ':FIELD_TYPE_HUMIDITY', value: 33, defaultValue: '50', icon: '\u0021', enLabel: {
    short: 'Humid',
    medium: 'Humidity',
    long: 'Current Humidity'
  }},
  { label: '风速', metricSymbol: ':FIELD_TYPE_WIND_SPEED', value: 34, defaultValue: '10', icon: '\u0021', enLabel: {
    short: 'Wind',
    medium: 'Wind Speed',
    long: 'Current Wind Speed'
  }},
  { label: '传感器温度', metricSymbol: ':FIELD_TYPE_SENSOR_TEMPERATURE', value: 35, defaultValue: '20', icon: '\u0021', enLabel: {
    short: 'Sensor',
    medium: 'Sensor Temp',
    long: 'Sensor Temperature'
  }},
  { label: '天气描述', metricSymbol: ':FIELD_TYPE_WEATHER_DESCRIPTION', value: 36, defaultValue: 'Clear Sky', icon: '\u0021', enLabel: {
    short: 'Sky',
    medium: 'Weather',
    long: 'Weather Description'
  }},
  { label: '呼吸频率', metricSymbol: ':FIELD_TYPE_RESPIRATION_RATE', value: 37, defaultValue: '16', icon: '\u0037', enLabel: {
    short: 'Resp',
    medium: 'Respiration',
    long: 'Respiration Rate'
  }},
  { label: '静息心率', metricSymbol: ':FIELD_TYPE_RESTING_HEARTRATE', value: 38, defaultValue: '70', icon: '\u0038', enLabel: {
    short: 'RHR',
    medium: 'Rest HR',
    long: 'Resting Heart Rate'
  }},
  { label: '周游泳距离', metricSymbol: ':FIELD_TYPE_WEEKLY_SWIMMING_DISTANCE', value: 39, defaultValue: '1', icon: '\u0048', enLabel: {
    short: 'Swim',
    medium: 'Swim Dist',
    long: 'Weekly Swimming Distance'
  }},
  { label: '周步行距离', metricSymbol: ':FIELD_TYPE_WEEKLY_WALKING_DISTANCE', value: 40, defaultValue: '10', icon: '\u0049', enLabel: {
    short: 'Walk',
    medium: 'Walk Dist',
    long: 'Weekly Walking Distance'
  }},
  { label: '气压', metricSymbol: ':FIELD_TYPE_WEATHER_PRESSURE', value: 50, defaultValue: '1013', icon: '\u0063', enLabel: {
    short: 'Press',
    medium: 'Pressure',
    long: 'Barometric Pressure'
  }},
  { label: '温度范围', metricSymbol: ':FIELD_TYPE_TEMPERATURE_RANGE', value: 51, defaultValue: '25', icon: '\u0021', enLabel: {
    short: 'Range',
    medium: 'Temp Range',
    long: 'Temperature Range'
  }},
  { label: '紫外线指数', metricSymbol: ':FIELD_TYPE_WEATHER_UVINDEX', value: 52, defaultValue: '3', icon: '\u0021', enLabel: {
    short: 'UV',
    medium: 'UV Index',
    long: 'Ultraviolet Index'
  }},
  { label: '露点', metricSymbol: ':FIELD_TYPE_WEATHER_DEWPOINT', value: 53, defaultValue: '10', icon: '\u0021', enLabel: {
    short: 'Dew',
    medium: 'Dew Point',
    long: 'Dew Point Temperature'
  }},
  { label: '云量', metricSymbol: ':FIELD_TYPE_WEATHER_CLOUDS', value: 54, defaultValue: '50', icon: '\u0021', enLabel: {
    short: 'Cloud',
    medium: 'Cloud Cover',
    long: 'Cloud Coverage Percent'
  }},
  { label: '能见度', metricSymbol: ':FIELD_TYPE_WEATHER_VISIBILITY', value: 55, defaultValue: '10', icon: '\u0021', enLabel: {
    short: 'Vis',
    medium: 'Visibility',
    long: 'Visibility Distance'
  }},
  { label: 'VO2Max', metricSymbol: ':FIELD_TYPE_VO2_MAX', value: 57, defaultValue: '40', icon: '\u003a', enLabel: {
    short: 'VO2',
    medium: 'VO2 Max',
    long: 'Maximum Oxygen Uptake'
  }},
  { label: '位置信息', metricSymbol: ':FIELD_TYPE_LOCATION', value: 58, defaultValue: 'Los Angeles', icon: '\u0021', enLabel: {
    short: 'Loc',
    medium: 'Location',
    long: 'Current Location'
  }},
  { label: '年', metricSymbol: ':FIELD_TYPE_DATE_YEAR', value: 70, defaultValue: '2023', icon: '\u0021', enLabel: {
    short: 'Yr',
    medium: 'Year',
    long: 'Current Year'
  }},
  { label: '月', metricSymbol: ':FIELD_TYPE_DATE_MONTH', value: 71, defaultValue: '10', icon: '\u0021', enLabel: {
    short: 'Mo',
    medium: 'Month',
    long: 'Current Month'
  }},
  { label: '日', metricSymbol: ':FIELD_TYPE_DATE_DAY', value: 72, defaultValue: '10', icon: '\u0021', enLabel: {
    short: 'Day',
    medium: 'Day',
    long: 'Day of Month'
  }},
  { label: '星期几', metricSymbol: ':FIELD_TYPE_DATE_WEEKDAY', value: 76, defaultValue: '1', icon: '\u0021', enLabel: {
    short: 'Wkday',
    medium: 'Weekday',
    long: 'Day of Week'
  }},
  { label: '第几周', metricSymbol: ':FIELD_TYPE_DATE_YEARWEEK', value: 77, defaultValue: '29', icon: '\u0021', enLabel: {
    short: 'Wk',
    medium: 'Week',
    long: 'Week of Year'
  }},
  // ---------------------------- 目标数据项 --------------------------------
  { label: '目标步数', metricSymbol: ':GOAL_TYPE_STEPS', value: 101, defaultValue: '8000', icon: '\u0031', enLabel: {
    short: 'Goal Steps',
    medium: 'Target Steps',
    long: 'Daily Step Goal'
  }},
  { label: '目标卡路里', metricSymbol: ':GOAL_TYPE_CALORIES', value: 102, defaultValue: '500', icon: '\u0032', enLabel: {
    short: 'Goal Cal',
    medium: 'Target Calories',
    long: 'Daily Calorie Goal'
  }},
  { label: '目标爬楼', metricSymbol: ':GOAL_TYPE_FLOORS_CLIMBED', value: 103, defaultValue: '20', icon: '\u0033', enLabel: {
    short: 'Goal Floors',
    medium: 'Target Floors',
    long: 'Daily Floor Goal'
  }},
  { label: '目标设备电量', metricSymbol: ':GOAL_TYPE_BATTERY', value: 100, defaultValue: '80', icon: '\u0026', enLabel: {
    short: 'Batt Goal',
    medium: 'Battery Goal',
    long: 'Battery Level Goal'
  }},
  { label: '目标心率', metricSymbol: ':GOAL_TYPE_HEART_RATE', value: 104, defaultValue: '120', icon: '\u0030', enLabel: {
    short: 'HR Goal',
    medium: 'Heart Rate Goal',
    long: 'Target Heart Rate Zone'
  }},
  { label: '目标身体电量', metricSymbol: ':GOAL_TYPE_BODY_BATTERY', value: 111, defaultValue: '60', icon: '\u0035', enLabel: {
    short: 'Body Goal',
    medium: 'Body Batt Goal',
    long: 'Target Body Battery'
  }},
  { label: '目标每日活动时间', metricSymbol: ':GOAL_TYPE_DAYLY_ACTIVE_MINUTES', value: 105, defaultValue: '60', icon: '\u0044', enLabel: {
    short: 'Act Goal',
    medium: 'Active Min Goal',
    long: 'Daily Active Minutes Goal'
  }},
  { label: '目标每周活动时间', metricSymbol: ':GOAL_TYPE_WEEKLY_ACTIVE_MINUTES', value: 106, defaultValue: '300', icon: '\u0044', enLabel: {
    short: 'Wk Act Goal',
    medium: 'Weekly Active Goal',
    long: 'Weekly Active Minutes Goal'
  }},
  { label: '周跑步目标距离', metricSymbol: ':GOAL_TYPE_WEEKLY_RUN_DISTANCE', value: 107, defaultValue: '20', icon: '\u0046', enLabel: {
    short: 'Run Goal',
    medium: 'Run Dist Goal',
    long: 'Weekly Running Distance Goal'
  }},
  { label: '周骑行目标距离', metricSymbol: ':GOAL_TYPE_WEEKLY_CYCLING_DISTANCE', value: 108, defaultValue: '30', icon: '\u0047', enLabel: {
    short: 'Cycle Goal',
    medium: 'Cycling Goal',
    long: 'Weekly Cycling Distance Goal'
  }},
  { label: '周游泳目标距离', metricSymbol: ':GOAL_TYPE_WEEKLY_SWIMMING_DISTANCE', value: 109, defaultValue: '2', icon: '\u0048', enLabel: {
    short: 'Swim Goal',
    medium: 'Swimming Goal',
    long: 'Weekly Swimming Distance Goal'
  }},
  { label: '周步行目标距离', metricSymbol: ':GOAL_TYPE_WEEKLY_WALKING_DISTANCE', value: 110, defaultValue: '20', icon: '\u0049', enLabel: {
    short: 'Walk Goal',
    medium: 'Walking Goal',
    long: 'Weekly Walking Distance Goal'
  }},
  { label: '秒针', metricSymbol: ':GOAL_TYPE_SECOND_OF_MINUTE', value: 120, defaultValue: '40', icon: '\u0021', enLabel: {
    short: 'Sec',
    medium: 'Second',
    long: 'Second of Minute'
  }}
]

// 获取指标配置信息
export function getMetricBySymbol(metricSymbol) {
  return DataTypeOptions.find((item) => item.metricSymbol === metricSymbol)
}
