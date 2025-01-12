// 默认选项
const defaultOptions = {
  selectable: true,
  hasControls: true,
  hasBorders: true,
};

// 获取时间值
function getTimeValue(timeType) {
  const now = new Date();
  switch (timeType) {
    case "hour":
      return now.getHours().toString().padStart(2, "0");
    case "minute":
      return now.getMinutes().toString().padStart(2, "0");
    case "second":
      return now.getSeconds().toString().padStart(2, "0");
    case "date":
      return now.toLocaleDateString();
    default:
      return "";
  }
}

// 确保文本值是字符串
function ensureString(value) {
  return value?.toString() || "";
}