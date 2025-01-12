import { alignmentIcons, layoutIcons } from './icons';

// 字体大小选项
export const fontSizes = [
    6, 7, 8, 9, 10, 11, 12, 14, 16, 18, 21, 24, 30, 36, 42, 48, 54, 60, 66, 72,
    78, 84, 96, 108, 120, 132, 144, 156, 168, 180, 192, 204
];

// 获取字体大小, step: 步长
// 1: 加大字体, 也可以为其他正数
// -1: 减小字体
export const getFontSizeByStep = (fontSize, step) => {
    const index = fontSizes.indexOf(fontSize);
    const newIndex = index + step;
    if (newIndex >= 0 && newIndex < fontSizes.length) {
        return fontSizes[newIndex];
    }
    return fontSize;
};

// 水平对齐方式选项
export const originXOptions = [
    { value: 'left', label: '左对齐', icon: alignmentIcons.left },
    { value: 'center', label: '居中', icon: alignmentIcons.center },
    { value: 'right', label: '右对齐', icon: alignmentIcons.right }
];

// 垂直对齐方式选项
export const originYOptions = [
    { value: 'top', label: '向上', icon: alignmentIcons.top },
    { value: 'center', label: '居中', icon: alignmentIcons.middle },
    { value: 'bottom', label: '向下', icon: alignmentIcons.bottom }
];

export const TimeFormatOptions = [
    { value: 'HH:mm:ss', label: 'HH:mm:ss' },
    { value: 'HH:mm', label: 'HH:mm' },
    { value: 'HH', label: 'HH' },
    { value: 'mm', label: 'mm' },
    { value: 'ss', label: 'ss' },
    { value: 'HH:', label: 'HH:' },
    { value: ':mm', label: ':mm' },
];

export const DateFormatOptions = [
    "ddd, MMM D",
    "YYYY-MM-DD",
    "MM/DD/YYYY",
    "DD-MM-YYYY",
    "DD/MM/YYYY",
    "MMMM D, YYYY",
    "D MMMM YYYY",
    "MMMM Do, YYYY",
    "MMM D, YYYY",
    "MMM D",
    "dddd, MMM D",
    "dddd, MMMM D, YYYY",
    "YYYY/MM/DD",
    "YYYY.MM.DD",
    "DD.MM.YYYY",
];

// 布局方式选项
export const LayoutOptions = [
    { value: ':LAYOUT_TYPES_CENTER', label: '水平居中', icon: layoutIcons[':LAYOUT_TYPES_CENTER'] },
    { value: ':LAYOUT_TYPES_LEFT', label: '水平向左', icon: layoutIcons[':LAYOUT_TYPES_LEFT'] },
    { value: ':LAYOUT_TYPES_RIGHT', label: '水平向右', icon: layoutIcons[':LAYOUT_TYPES_RIGHT'] }
];

export const DataTypeOptions = [
    { label: '心率', metricSymbol: ':FIELD_TYPE_HEART_RATE', value: 0, defaultValue: '80', icon: '\u0030', enLabel: 'Heart Rate' },
    { label: '步数', metricSymbol: ':FIELD_TYPE_STEPS', value: 1, defaultValue: '1000', icon: '\u0031', enLabel: 'Steps' },
    { label: '卡路里', metricSymbol: ':FIELD_TYPE_CALORIES', value: 2, defaultValue: '200', icon: '\u0032', enLabel: 'Calories' },
    { label: '爬楼', metricSymbol: ':FIELD_TYPE_FLOORS_CLIMBED', value: 3, defaultValue: '10', icon: '\u0033', enLabel: 'Floors Climbed' },
    { label: '纬度', metricSymbol: ':FIELD_TYPE_ALTITUDE', value: 4, defaultValue: '0', icon: '\u0034', enLabel: 'Latitude' },
    { label: '距离', metricSymbol: ':FIELD_TYPE_DISTANCE', value: 5, defaultValue: '5', icon: '\u0045', enLabel: 'Distance' },
    { label: '日出和日落 (废弃)', metricSymbol: ':FIELD_TYPE_SUN_RISE_SET', value: 6, defaultValue: '0', icon: '\u0021', enLabel: 'Sunrise and Sunset' },
    { label: '日出', metricSymbol: ':FIELD_TYPE_SUN_RISE', value: 7, defaultValue: '6', icon: '\u0060', enLabel: 'Sunrise' },
    { label: '日落', metricSymbol: ':FIELD_TYPE_SUN_SET', value: 8, defaultValue: '18', icon: '\u0061', enLabel: 'Sunset' },
    { label: '设备电量', metricSymbol: ':FIELD_TYPE_BATTERY', value: 9, defaultValue: '100', icon: '\u0026', enLabel: 'Battery' },
    { label: '每日活动时间', metricSymbol: ':FIELD_TYPE_DAYLY_ACTIVE_MINUTES', value: 10, defaultValue: '30', icon: '\u0044', enLabel: 'Daily Active Minutes' },
    { label: '每周活动时间', metricSymbol: ':FIELD_TYPE_WEEKLY_ACTIVE_MINUTES', value: 11, defaultValue: '150', icon: '\u0040', enLabel: 'Weekly Active Minutes' },
    { label: '周跑步距离', metricSymbol: ':FIELD_TYPE_WEEKLY_RUN_DISTANCE', value: 12, defaultValue: '10', icon: '\u0046', enLabel: 'Weekly Run Distance' },
    { label: '周骑行距离', metricSymbol: ':FIELD_TYPE_WEEKLY_CYCLING_DISTANCE', value: 13, defaultValue: '15', icon: '\u0047', enLabel: 'Weekly Cycling Distance' },
    { label: '恢复时间', metricSymbol: ':FIELD_TYPE_TIME_TO_RECOVERY', value: 14, defaultValue: '24', icon: '\u0041', enLabel: 'Time to Recovery' },
    { label: '身体电量', metricSymbol: ':FIELD_TYPE_BODY_BATTERY', value: 15, defaultValue: '50', icon: '\u0035', enLabel: 'Body Battery' },
    { label: '血氧饱和度', metricSymbol: ':FIELD_TYPE_PULSE_OX', value: 16, defaultValue: '95', icon: '\u003b', enLabel: 'Pulse Ox' },
    { label: '睡眠时间', metricSymbol: ':FIELD_TYPE_SLEEP_TIME', value: 17, defaultValue: '8', icon: '\u0021', enLabel: 'Sleep Time' },
    { label: '压力', metricSymbol: ':FIELD_TYPE_STRESS', value: 18, defaultValue: '0', icon: '\u0036', enLabel: 'Stress' },
    { label: '通知', metricSymbol: ':FIELD_TYPE_NOTIFICATIONS', value: 19, defaultValue: '0', icon: '\u0025', enLabel: 'Notifications' },
    { label: '闹钟', metricSymbol: ':FIELD_TYPE_ALARMS', value: 20, defaultValue: '0', icon: '\u0024', enLabel: 'Alarms' },
    { label: '蓝牙连接状态', metricSymbol: ':INDICATOR_TYPE_BLUETOOTH', value: 21, defaultValue: '1', icon: '\u0022', enLabel: 'Bluetooth Connection Status' },
    { label: '天气', metricSymbol: ':FIELD_TYPE_WEATHER', value: 30, defaultValue: '0', icon: '\u0021', enLabel: 'Weather' },
    { label: '温度', metricSymbol: ':FIELD_TYPE_TEMPERATURE', value: 31, defaultValue: '25', icon: '\u0062', enLabel: 'Temperature' },
    { label: '体感温度', metricSymbol: ':FIELD_TYPE_FEELS_LIKE_TEMPERATURE', value: 32, defaultValue: '25', icon: '\u0021', enLabel: 'Feels Like Temperature' },
    { label: '湿度', metricSymbol: ':FIELD_TYPE_HUMIDITY', value: 33, defaultValue: '50', icon: '\u0021', enLabel: 'Humidity' },
    { label: '风速', metricSymbol: ':FIELD_TYPE_WIND_SPEED', value: 34, defaultValue: '10', icon: '\u0021', enLabel: 'Wind Speed' },
    { label: '传感器温度', metricSymbol: ':FIELD_TYPE_SENSOR_TEMPERATURE', value: 35, defaultValue: '20', icon: '\u0021', enLabel: 'Sensor Temperature' },
    { label: '天气描述', metricSymbol: ':FIELD_TYPE_WEATHER_DESCRIPTION', value: 36, defaultValue: '0', icon: '\u0021', enLabel: 'Weather Description' },
    { label: '呼吸频率', metricSymbol: ':FIELD_TYPE_RESPIRATION_RATE', value: 37, defaultValue: '16', icon: '\u0037', enLabel: 'Respiration Rate' },
    { label: '静息心率', metricSymbol: ':FIELD_TYPE_RESTING_HEARTRATE', value: 38, defaultValue: '70', icon: '\u0038', enLabel: 'Resting Heart Rate' },
    { label: '周游泳距离', metricSymbol: ':FIELD_TYPE_WEEKLY_SWIMMING_DISTANCE', value: 39, defaultValue: '1', icon: '\u0048', enLabel: 'Weekly Swimming Distance' },
    { label: '周步行距离', metricSymbol: ':FIELD_TYPE_WEEKLY_WALKING_DISTANCE', value: 40, defaultValue: '10', icon: '\u0049', enLabel: 'Weekly Walking Distance' },
    { label: '气压', metricSymbol: ':FIELD_TYPE_WEATHER_PRESSURE', value: 50, defaultValue: '1013', icon: '\u0063', enLabel: 'Weather Pressure' },
    { label: '温度范围', metricSymbol: ':FIELD_TYPE_TEMPERATURE_RANGE', value: 51, defaultValue: '25', icon: '\u0021', enLabel: 'Temperature Range' },
    { label: '紫外线指数', metricSymbol: ':FIELD_TYPE_WEATHER_UVINDEX', value: 52, defaultValue: '3', icon: '\u0021', enLabel: 'UV Index' },
    { label: '露点', metricSymbol: ':FIELD_TYPE_WEATHER_DEWPOINT', value: 53, defaultValue: '10', icon: '\u0021', enLabel: 'Dew Point' },
    { label: '云量', metricSymbol: ':FIELD_TYPE_WEATHER_CLOUDS', value: 54, defaultValue: '50', icon: '\u0021', enLabel: 'Cloud Cover' },
    { label: '能见度', metricSymbol: ':FIELD_TYPE_WEATHER_VISIBILITY', value: 55, defaultValue: '10', icon: '\u0021', enLabel: 'Visibility' },
    { label: 'VO2Max', metricSymbol: ':FIELD_TYPE_VO2_MAX', value: 57, defaultValue: '40', icon: '\u003a', enLabel: 'VO2 Max' },
    { label: '位置信息', metricSymbol: ':FIELD_TYPE_LOCATION', value: 58, defaultValue: '0', icon: '\u0021', enLabel: 'Location' },
    { label: '年', metricSymbol: ':FIELD_TYPE_DATE_YEAR', value: 70, defaultValue: '2023', icon: '\u0021', enLabel: 'Year' },
    { label: '月', metricSymbol: ':FIELD_TYPE_DATE_MONTH', value: 71, defaultValue: '1', icon: '\u0021', enLabel: 'Month' },
    { label: '日', metricSymbol: ':FIELD_TYPE_DATE_DAY', value: 72, defaultValue: '1', icon: '\u0021', enLabel: 'Day' },
    { label: '星期几', metricSymbol: ':FIELD_TYPE_DATE_WEEKDAY', value: 76, defaultValue: '1', icon: '\u0021', enLabel: 'Weekday' },
    { label: '第几周', metricSymbol: ':FIELD_TYPE_DATE_YEARWEEK', value: 77, defaultValue: '29', icon: '\u0021', enLabel: 'Week of Year' },
    // ---------------------------- 目标数据项 --------------------------------
    { label: '目标步数', metricSymbol: ':GOAL_TYPE_STEPS', value: 101, defaultValue: '8000', icon: '\u0031', enLabel: 'Target Steps' },
    { label: '目标卡路里', metricSymbol: ':GOAL_TYPE_CALORIES', value: 102, defaultValue: '500', icon: '\u0032', enLabel: 'Target Calories' },
    { label: '目标爬楼', metricSymbol: ':GOAL_TYPE_FLOORS_CLIMBED', value: 103, defaultValue: '20', icon: '\u0033', enLabel: 'Target Floors Climbed' },
    { label: '目标设备电量', metricSymbol: ':GOAL_TYPE_BATTERY', value: 100, defaultValue: '80', icon: '\u0026', enLabel: 'Target Battery' },
    { label: '目标心率', metricSymbol: ':GOAL_TYPE_HEART_RATE', value: 104, defaultValue: '120', icon: '\u0030', enLabel: 'Target Heart Rate' },
    { label: '目标身体电量', metricSymbol: ':GOAL_TYPE_BODY_BATTERY', value: 111, defaultValue: '60', icon: '\u0035', enLabel: 'Target Body Battery' },
    { label: '目标每日活动时间', metricSymbol: ':GOAL_TYPE_DAYLY_ACTIVE_MINUTES', value: 105, defaultValue: '60', icon: '\u0044', enLabel: 'Target Daily Active Minutes' },
    { label: '目标每周活动时间', metricSymbol: ':GOAL_TYPE_WEEKLY_ACTIVE_MINUTES', value: 106, defaultValue: '300', icon: '\u0044', enLabel: 'Target Weekly Active Minutes' },
    { label: '周跑步目标距离', metricSymbol: ':GOAL_TYPE_WEEKLY_RUN_DISTANCE', value: 107, defaultValue: '20', icon: '\u0046', enLabel: 'Target Weekly Run Distance' },
    { label: '周骑行目标距离', metricSymbol: ':GOAL_TYPE_WEEKLY_CYCLING_DISTANCE', value: 108, defaultValue: '30', icon: '\u0047', enLabel: 'Target Weekly Cycling Distance' },
    { label: '周游泳目标距离', metricSymbol: ':GOAL_TYPE_WEEKLY_SWIMMING_DISTANCE', value: 109, defaultValue: '2', icon: '\u0048', enLabel: 'Target Weekly Swimming Distance' },
    { label: '周步行目标距离', metricSymbol: ':GOAL_TYPE_WEEKLY_WALKING_DISTANCE', value: 110, defaultValue: '20', icon: '\u0049', enLabel: 'Target Weekly Walking Distance' },
    { label: '秒针', metricSymbol: ':GOAL_TYPE_SECOND_OF_MINUTE', value: 120, defaultValue: '40', icon: '\u0021', enLabel: 'Second of Minute' },
  ];
  
// 获取指标配置信息
export function getMetricBySymbol(metricSymbol) {
    ('metricSymbol', metricSymbol)
    return DataTypeOptions.find(item => item.metricSymbol === metricSymbol);
}
