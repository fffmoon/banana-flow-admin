/*
 * @Author: Qing
 * @Description: 简单的动画hooks，目前不是很好用，后续再完善
 * @Date: 2025-03-08 15:39:39
 * @LastEditTime: 2025-03-11 09:41:39
 */
import { useThemeStore } from '../theme/store'

export function useAnimation() {
  // 动画处理方法
  const addAnimateClass = (target: HTMLElement, options: { className?: string, duration?: number }) => {
    const defaultOptions = {
      className: 'animate',
      duration: 1000 * 1,
    }
    const config = Object.assign(defaultOptions, options)

    if (!target || !(target instanceof HTMLElement))
      return

    const ANIMATE_FLAG = 'data-animating'
    // 如果已有动画在进行，且不强制重新执行
    if (target.getAttribute(ANIMATE_FLAG) === 'true') {
      return
    }
    // 删除旧的数据
    target.classList.remove(config.className)

    // 标记动画开始
    target.setAttribute(ANIMATE_FLAG, 'true')

    requestAnimationFrame(() => {
      target.classList.add(config.className)
    })

    if (config.duration) {
      setTimeout(() => {
        target.classList.remove(config.className)
        target.setAttribute(ANIMATE_FLAG, 'false')
      }, config.duration)
    }
  }

  const toggleThemeAnimation = async ({ clientX, clientY }: { clientX: number, clientY: number }) => {
    const themeStore = useThemeStore()
    function handler() {
      themeStore.toggleActiveThemeMode()
    }

    if (!document.startViewTransition) {
      return handler()
    }

    const clipPath = [
      `circle(0px at ${clientX}px ${clientY}px)`,
      `circle(${Math.hypot(
        Math.max(clientX, window.innerWidth - clientX),
        Math.max(clientY, window.innerHeight - clientY),
      )}px at ${clientX}px ${clientY}px)`,
    ]

    await document.startViewTransition(handler).ready

    document.documentElement.animate(
      { clipPath: themeStore.getIsDarkTheme ? clipPath.reverse() : clipPath },
      {
        duration: 500,
        easing: 'ease-in',
        pseudoElement: `::view-transition-${themeStore.getIsDarkTheme ? 'old' : 'new'}(root)`,
      },
    )
  }

  return {
    addAnimateClass,
    toggleThemeAnimation,
  }
}
