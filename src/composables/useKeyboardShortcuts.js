import Mousetrap from 'mousetrap'
import { onMounted, onUnmounted } from 'vue'
import { useBaseElementStore } from '../stores/elements/baseElement'
import emitter from '@/utils/eventBus'

export function useKeyboardShortcuts() {
  const baseStore = useBaseElementStore()

  onMounted(() => {
    // 阻止浏览器默认快捷键
    const preventDefaultShortcuts = (e) => {
      // 如果是在输入框内，允许默认行为
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
        return
      }

      // 阻止的快捷键列表
      const blockedShortcuts = [
        'ctrl+d', 'ctrl+f', 'ctrl+h', 'ctrl+p', 'ctrl+s', 'ctrl+w',
        'command+d', 'command+f', 'command+h', 'command+p', 'command+s', 'command+w'
      ]

      const key = e.key.toLowerCase()
      const isCtrl = e.ctrlKey
      const isCommand = e.metaKey
      const shortcut = `${isCtrl ? 'ctrl+' : isCommand ? 'command+' : ''}${key}`

      if (blockedShortcuts.includes(shortcut)) {
        e.preventDefault()
        e.stopImmediatePropagation() // 加强阻止传播，防止 Mousetrap 或其他插件响应
        return false
      }
    }

    // 在捕获阶段添加事件监听
    document.addEventListener('keydown', preventDefaultShortcuts, { capture: true })

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
    Mousetrap.bind('shift+=', () => baseStore.changeFontSize(1)) // shift + = 键（加号）
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

    // 绑定 App Properties 快捷键
    Mousetrap.bind(['command+,', 'ctrl+,'], () => {
      emitter.emit('open-app-properties')
      return false // 阻止默认行为
    })
    // 绑定 快捷键 Command + . 打开 View 配置面板
    Mousetrap.bind(['command+.', 'ctrl+.'], () => {
      emitter.emit('open-view-properties')
      return false // 阻止默认行为
    })
  })

  onUnmounted(() => {
    // 清理绑定
    Mousetrap.unbind([
      'left', 'right', 'up', 'down',
      'shift+left', 'shift+right', 'shift+up', 'shift+down',
      'shift+=', 'shift+-',
      'command+c', 'ctrl+c', 'command+v', 'ctrl+v',
      'command+,', 'ctrl+,'
    ])
    // 移除事件监听
  })
}
