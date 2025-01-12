import Mousetrap from 'mousetrap'
import { onMounted, onUnmounted } from 'vue'
import { useBaseElementStore } from '../stores/elements/baseElement'

export function useKeyboardShortcuts() {
  const baseStore = useBaseElementStore()

  onMounted(() => {
    // 绑定方向键
    Mousetrap.bind('left', () => baseStore.moveElement('left', 1))
    Mousetrap.bind('right', () => baseStore.moveElement('right', 1))
    Mousetrap.bind('up', () => baseStore.moveElement('up', 1))
    Mousetrap.bind('down', () => baseStore.moveElement('down', 1))

    // 绑定Shift+方向键，步长翻倍
    Mousetrap.bind('shift+left', () => baseStore.moveElement('left', 2))
    Mousetrap.bind('shift+right', () => baseStore.moveElement('right', 2))
    Mousetrap.bind('shift+up', () => baseStore.moveElement('up', 2))
    Mousetrap.bind('shift+down', () => baseStore.moveElement('down', 2))

    // 绑定Shift+加减号，修改字体大小
    Mousetrap.bind('shift+=', () => baseStore.changeFontSize(1))  // shift + = 键（加号）
    Mousetrap.bind('shift+-', () => baseStore.changeFontSize(-1)) // shift + - 键（减号）

    // 绑定复制粘贴快捷键
    Mousetrap.bind(['command+c', 'ctrl+c'], () => {
      baseStore.copySelectedElements()
      return false // 阻止默认行为
    })
    
    Mousetrap.bind(['command+v', 'ctrl+v'], () => {
      baseStore.pasteElements()
      return false // 阻止默认行为
    })
  })

  onUnmounted(() => {
    // 清理绑定
    Mousetrap.unbind([
      'left', 'right', 'up', 'down',
      'shift+left', 'shift+right', 'shift+up', 'shift+down',
      'shift+=', 'shift+-',
      'command+c', 'ctrl+c',
      'command+v', 'ctrl+v'
    ])
  })
}
