<script lang='ts' setup>
import type { Placement } from '@ui/BetterUI'

// 逻辑，处理
interface IProps {
  placement: Placement
}
const props = withDefaults(defineProps<IProps>(), {
})

// #region ➤ 处理弹框位置
// ================================================

const isOpacity = ref(true)
const contextMenuRef = ref<HTMLElement | null>(null)
// 计算后位置（自动调整）
// const computedActualPlacement = ref<Placement>(props.placement)
const contextStyle = ref({})
const arrowWrapPositionStyles = reactive({
  contextWrapStyle: {},
  arrowBoxStyle: {},
})
const arrowPositionStyle = ref({})

function updateCurrentPositions() {
  // console.log('updateCurrentPositions')
  if (!contextMenuRef.value)
    return false
  // 获取触发元素位置
  const triggerRect = (contextMenuRef.value as HTMLElement).getBoundingClientRect()
  // 计算视窗可用空间
  const windowWidth = window.innerWidth
  const windowHeight = window.innerHeight
  const spaceLeft = triggerRect.left
  const spaceRight = windowWidth - triggerRect.right
  const spaceTop = triggerRect.top
  const spaceBottom = windowHeight - triggerRect.bottom
  /* console.log('144', { triggerRect, windowWidth, windowHeight }, {
    spaceLeft,
    spaceRight,
    spaceTop,
    spaceBottom,
  }) */

  // 根据可用空间调整位置
  let newPlacement: Placement = props.placement

  // 水平方向调整
  if (newPlacement.includes('right') && spaceRight < 0) {
    newPlacement = newPlacement.replace('right', 'left') as Placement
  }
  else if (newPlacement.includes('left') && spaceLeft < 0) {
    newPlacement = newPlacement.replace('left', 'right') as Placement
  }

  // 垂直方向调整
  if (newPlacement.includes('bottom') && spaceBottom < 0) {
    newPlacement = newPlacement.replace('bottom', 'top') as Placement
  }
  else if (newPlacement.includes('top') && spaceTop < 0) {
    newPlacement = newPlacement.replace('top', 'bottom') as Placement
  }
  else if (newPlacement.includes('start') && spaceBottom < 0) {
    newPlacement = newPlacement.replace('start', 'end') as Placement
  }
  else if (newPlacement.includes('end') && spaceBottom < 0) {
    newPlacement = newPlacement.replace('end', 'start') as Placement
  }

  // console.log('138', newPlacement);

  if (newPlacement === 'top') {
    if (spaceLeft < 0) {
      newPlacement = 'top-start'
    }
    else if (spaceRight < 0) {
      newPlacement = 'top-end'
    }
  }
  else if (newPlacement === 'bottom') {
    if (spaceLeft < 0) {
      newPlacement = 'bottom-start'
    }
    else if (spaceRight < 0) {
      newPlacement = 'bottom-end'
    }
  }
  else if (newPlacement === 'left') {
    if (spaceTop < 0) {
      newPlacement = 'left-start'
    }
    else if (spaceBottom < 0) {
      newPlacement = 'left-end'
    }
  }
  else if (newPlacement === 'right') {
    if (spaceTop < 0) {
      newPlacement = 'right-start'
    }
    else if (spaceBottom < 0) {
      newPlacement = 'right-end'
    }
  }
  // console.log('177', newPlacement);

  isOpacity.value = false
  contextStyle.value = getPostionStyle(newPlacement)
  const res = arrowWrapPosition(newPlacement)
  arrowWrapPositionStyles.contextWrapStyle = res.contextWrapStyle
  arrowWrapPositionStyles.arrowBoxStyle = res.arrowBoxStyle
  arrowPositionStyle.value = arrowPosition(newPlacement)
}

function updatePosition() {
  isOpacity.value = true
  contextStyle.value = getPostionStyle(props.placement)
  const res = arrowWrapPosition(props.placement)
  arrowWrapPositionStyles.contextWrapStyle = res.contextWrapStyle
  arrowWrapPositionStyles.arrowBoxStyle = res.arrowBoxStyle
  arrowPositionStyle.value = arrowPosition(props.placement)
  nextTick(() => {
    requestAnimationFrame(() => {
      updateCurrentPositions()
    })
  })
}

onMounted(() => {
  updatePosition()
})

// #endregion 处理弹框位置
// #region ➤ 处理箭头位置
// ================================================

// 箭头外框的定位

function arrowWrapPosition(placement: Placement) {
  if (placement.includes('top')) {
    return {
      contextWrapStyle: {
        'margin-bottom': '10px',
      },
      arrowBoxStyle: {
        top: '100%',
        left: '0',
        height: '10px',
        width: '100%',
      },
    }
  }
  else if (placement.includes('right')) {
    return {
      contextWrapStyle: {
        'margin-left': '10px',
      },
      arrowBoxStyle: {
        top: '0',
        right: '100%',
        height: '100%',
        width: '10px',
      },
    }
  }
  else if (placement.includes('bottom')) {
    return {
      contextWrapStyle: {
        'margin-top': '10px',
      },
      arrowBoxStyle: {
        bottom: '100%',
        left: '0',
        height: '10px',
        width: '100%',
      },
    }
  }
  else if (placement.includes('left')) {
    return {
      contextWrapStyle: {
        'margin-right': '10px',
      },
      arrowBoxStyle: {
        top: '0',
        left: '100%',
        height: '100%',
        width: '10px',
      },
    }
  }
  return {
    contextWrapStyle: {
      'margin-bottom': '10px',
    },
    arrowBoxStyle: {
      top: '100%',
      left: '0',
      height: '10px',
      width: '100%',
    },
  }
}
// 箭头的方向
function arrowPosition(placement: Placement) {
  switch (placement) {
    // 顶部箭头
    case 'top-start':
      return {
        bottom: 'calc(var(--n-arrow-height) * 1.414 / -2)',
        left: '10px',
        transform: 'rotate(45deg)',
      }

    case 'top':
      return {
        bottom: 'calc(var(--n-arrow-height) * 1.414 / -2)',
        left: '50%',
        transform: 'translateX(-50%) rotate(45deg)',
      }

    case 'top-end':
      return {
        bottom: 'calc(var(--n-arrow-height) * 1.414 / -2)',
        right: '10px',
        transform: 'rotate(45deg)',
      }

    // 右侧箭头
    case 'right-start':
      return {
        top: '10px',
        right: 'calc(var(--n-arrow-height) * 1.414 / -2)',
        transform: 'rotate(135deg)',
      }

    case 'right':
      return {

        top: '50%',
        right: 'calc(var(--n-arrow-height) * 1.414 / -2)',
        transform: 'translateY(-50%) rotate(135deg)',
      }

    case 'right-end':
      return {
        top: 'auto',
        bottom: '10px',
        right: 'calc(var(--n-arrow-height) * 1.414 / -2)',
        transform: 'rotate(135deg)',
      }

    // 底部箭头（默认）
    case 'bottom-start':
      return {
        bottom: 'calc(var(--n-arrow-height) * 1.414 / -2)',
        left: '10px',
        transform: 'rotate(135deg)',
      }

    case 'bottom':
      return {

        bottom: 'calc(var(--n-arrow-height) * 1.414 / -2)',
        left: '50%',
        transform: 'translateX(-50%) rotate(45deg)',
      }

    case 'bottom-end':
      return {

        bottom: 'calc(var(--n-arrow-height) * 1.414 / -2)',
        right: '10px',
      }

    // 左侧箭头
    case 'left-start':
      return {

        top: '10px',
        left: 'calc(var(--n-arrow-height) * 1.414 / -2)',
        transform: 'rotate(-45deg)',
      }

    case 'left':
      return {

        top: '50%',
        left: 'calc(var(--n-arrow-height) * 1.414 / -2)',
        transform: 'translateY(-50%) rotate(-45deg)',
      }

    case 'left-end':
      return {

        top: 'auto',
        bottom: '10px',
        left: 'calc(var(--n-arrow-height) * 1.414 / -2)',
        transform: 'rotate(-45deg)',
      }

    // 默认底部居中箭头
    default:
      return {

        top: 'calc(var(--n-arrow-height) * 1.414 / -2)',
        left: '50%',
        transform: 'translateX(-50%) rotate(45deg)',
      }
  }
}

// #endregion
</script>

<template>
  <div ref="contextMenuRef" class="context-box" :style="contextStyle" :class="{ 'is-opacity': isOpacity }">
    <div class="context-wrap" :style="arrowWrapPositionStyles.contextWrapStyle">
      <div class="content-box">
        <slot></slot>
      </div>
      <div class="arrow-box" :style="arrowWrapPositionStyles.arrowBoxStyle">
        <div class="arrow" :style="arrowPositionStyle"></div>
      </div>
    </div>
  </div>
</template>

<style lang='scss' scoped>
.context-box {
  z-index: 999;
  position: absolute;
  pointer-events: auto;
  transform-origin: top left;

  .context-wrap {
    --n-padding: 8px 14px;
    --n-arrow-height: 6px;

    position: relative;
    padding: var(--n-padding);
    background-color: var(--custom-base-color);
    transition: transform 0.1s ease-out;
    border-radius: var(--custom-border-radius);
    border: 1px solid var(--custom-border-color);
    box-shadow: var(--custom-box-shadow-1);
    color: var(--custom-text-color-base);

    .content-box {
      white-space: nowrap;
      word-break: normal;
    }

    .arrow-box {
      position: absolute;
      overflow: hidden;

      .arrow {
        position: absolute;
        display: block;
        width: calc(var(--n-arrow-height) * 1.414);
        height: calc(var(--n-arrow-height) * 1.414);
        border: 1px solid var(--custom-border-color);
        box-shadow: var(--custom-box-shadow-1);
        background-color: var(--custom-base-color);
        pointer-events: all;
      }
    }

  }

}

.is-opacity {
  opacity: 0;
}
</style>
