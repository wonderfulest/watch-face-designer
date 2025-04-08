// 应用全局配置
export default {
  // 自动保存相关配置
  autoSave: {
    // 自动保存间隔 (毫秒)
    interval: 10 * 1000, // 20秒
    // 是否启用自动保存
    enabled: true
  },

  // 可以添加其他全局配置
  api: {
    timeout: 30000
  },

  // 字体相关配置
  fonts: {
    // ...
  },

  // 更新日志数据
   changelog: {
    // 是否启用更新日志
    enabled: true,
    // 存储在 localStorage 中的键名
    storageKey: 'last-viewed-changelog-version',
    // 更新日志数据
    versions: [
      // {
      // 获取设计列表时，需要得到 设计的收藏状态，是否被当前用户收藏
      // 用户反馈评分功能 在底部自动弹出 1-10 个星星 让用户评分，可以选择输入用户建议后提交
      // },
      {
        version: '1.0.2',
        date: '2025-04-08',
        updates: ['新增系统推荐模板功能', '新增用户邮件反馈功能', '增加用户退出、重新登录，清空本地存储机制']
      },
      {
        version: '1.0.1',
        date: '2025-04-07',
        updates: ['优化 ProgressRing 元素的显示效果；支持顺时针和逆时针方向选择；支持进度条的显示', '新增快捷键操作面板', '修复部分已知问题']
      },
      {
        version: '1.0.0',
        date: '2025-04-06',
        updates: ['首次发布', '支持基础表盘设计功能', '支持导出设计文件']
      }
    ]
  }
}
