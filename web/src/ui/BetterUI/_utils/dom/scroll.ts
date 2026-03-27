import type { Placement } from '@ui/BetterUI'

// 获取所有可滚动的祖先元素
export function getScrollParents(element: HTMLElement | null) {
  const scrollParents: HTMLElement[] = []
  if (!element)
    return scrollParents

  let parent = element.parentElement
  while (parent && parent !== document.documentElement) {
    const style = getComputedStyle(parent)
    if (
      style.overflow === 'auto'
      || style.overflow === 'scroll'
      || style.overflowX === 'auto'
      || style.overflowX === 'scroll'
      || style.overflowY === 'auto'
      || style.overflowY === 'scroll'
    ) {
      scrollParents.push(parent)
    }
    parent = parent.parentElement
  }
  return scrollParents
};

// 将方位转为css变量
export function getPostionStyle(placement: Placement) {
  switch (placement) {
    case 'top-start':
      return {
        bottom: '100%',
        left: '0',
      }

    case 'top':
      return {
        bottom: '100%',
        left: '50%',
        transform: `translatex(-50%)`,
      }

    case 'top-end':
      return {
        bottom: '100%',
        right: '0',
      }

    case 'right-start':
      return {
        top: '0',
        left: '100%',
      }

    case 'right':
      return {
        top: '50%',
        left: '100%',
        transform: `translateY(-50%)`,
      }

    case 'right-end':
      return {
        bottom: '0',
        left: '100%',
      }

    case 'bottom-start':
      return {
        top: '100%',
        left: '0',
      }

    case 'bottom':
      return {
        top: '100%',
        left: '50%',
        transform: `translateX(-50%)`,
      }

    case 'bottom-end':
      return {
        top: '100%',
        right: '0',
      }

    case 'left-start':
      return {
        top: '0',
        right: '100%',
      }

    case 'left':
      return {
        top: '50%',
        right: '100%',
        transform: `translateY(-50%)`,
      }

    case 'left-end':
      return {
        bottom: '0',
        right: '100%',
      }

    default:
      return {
        top: '100%',
        left: '0',
      }
  }
}
