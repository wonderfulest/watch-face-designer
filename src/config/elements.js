import { assign } from "lodash-es"

// 元素默认配置
export const elementAttribute = {
  left: 227,
  top: 227,
  width: 100,
  height: 40,
  originX: 'center',
  originY: 'center',
  fill: '#FFFFFF',
  bgColor: '#FFFFFF', // 进度环背景颜色
  backgroundColor: '#FFFFFF',
  fontFamily: 'RobotoCondensed-Regular',
  color: '#FFFFFF', // 进度环颜色
  fontSize: 36,
  iconSize: 42,
  selectable: false,
  hasControls: true,
  hasBorders: true,
  lockMovementX: true,
  lockMovementY: true,
  lockRotation: true,
  lockScalingX: true,
  lockScalingY: true,
  lockUniScaling: true,
  evented: false,
  xPadding: 0.06,
  yPadding: 0.02,
  stroke: '#FFAA00',
  strokeWidth: 2,
  borderRadius: 8, // 默认圆角
  badgeType: 12, // 徽章默认数据类型：电池电量
  textColor: '#FFFFFF',
  metricSymbol: ':FIELD_TYPE_HEART_RATE',
  iconFontFamily: 'Yoghurt-One',
  startAngle: 120, // 进度环开始角度
  endAngle: 60, // 进度环结束角度
  counterClockwise: false, // 进度环方向: 顺时针: false, 逆时针: true
  radius: 50, // 进度环半径
  strokeWidth: 10, // 进度环宽度
  formatter: 0, // 时间格式 // HH:mm:ss
  dateFormatter: 8, // 日期格式 // Monday, Sep 5
  varName: '', // 数据变量名字
}

const indicatorAttribute = assign({}, elementAttribute, {
  left: 227,
  top: 227,
  originX: 'center',
  originY: 'center',
  fontSize: 42,
  fontFamily: 'Yoghurt-One',
  color: '#FFFFFF',
})

export const elementConfigs = {
  // 基础元素
  // basic: {
  //   text: { icon: 'mdi:note-text', label: '文本', defaultText: '新文本', size: 36, ...elementAttribute },
  //   image: { icon: 'mdi:image', label: '图片', ...elementAttribute },
  //   badge: { icon: 'bi:badge-8k-fill', label: '徽章', ...elementAttribute }
  // },
  // 时间元素
  time: {
    time: { icon: 'mdi:clock-time-four-outline', label: '时间', size: 96, formatter: 'HH:mm:ss', ...elementAttribute },
    date: { icon: 'mdi:calendar', label: '日期', size: 36, ...elementAttribute }
  },
  // 数据项元素
  metric: {
    icon: { metricSymbol: ':FIELD_TYPE_HEART_RATE', icon: 'ic:round-insert-emoticon', label: '图标', ...elementAttribute },
    data: { metricSymbol: ':FIELD_TYPE_HEART_RATE', icon: 'stash:data-numbers-solid', label: '数据', ...elementAttribute },
    label: { metricSymbol: ':FIELD_TYPE_HEART_RATE', icon: 'fa-brands:hips', label: '标签', ...elementAttribute }
  },
  // 指示器
  indicator: {
    bluetooth: { metricSymbol: ':INDICATOR_TYPE_BLUETOOTH', icon: 'material-symbols:bluetooth-rounded', label: '蓝牙', ...indicatorAttribute },
    disturb: { metricSymbol: ':INDICATOR_TYPE_DISTURB', icon: 'ic:outline-do-disturb-on', label: '勿扰时间', ...indicatorAttribute },
    alarms: { metricSymbol: ':INDICATOR_TYPE_ALARMS', icon: 'material-symbols:alarm-outline', label: '闹钟', ...indicatorAttribute },
    notification: { metricSymbol: ':INDICATOR_TYPE_NOTIFICATIONS', icon: 'hugeicons:notification-01', label: '手机通知', ...indicatorAttribute },
  },
  // 图形
  // shape: {
  //   rect: { icon: 'mdi:rectangle', label: '矩形', ...elementAttribute },
  //   circle: { icon: 'mdi:circle', label: '圆形', ...elementAttribute },
  //   triangle: { icon: 'mdi:triangle', label: '三角形', ...elementAttribute }
  // },
  // 进度
  progress: {
    bar: { icon: 'pajamas:progress', label: '进度条', ...elementAttribute },
    ring: {
      icon: 'material-symbols:data-usage-rounded',
      label: '进度环',
      ...elementAttribute
    }
  }
}
