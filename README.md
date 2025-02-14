
# 新增一种组件的流程

1. config/elements.js 中 配置组件类型

1. components/AddElementPanel.vue 中 增加 对应的store.addElement 方法

1. stores/elements 下增加对应元素的 store 文件

# 快捷键操作

- delete：删除元素： 当前在 LayerPanel 中 实现了单个元素的删除 和 取消删除，后续需要实现批量删除，并且将逻辑实现在 base store 中， 支持全局快捷键
- ctrl+z/command+z：撤销删除
