<script setup lang="ts">
import type { IMessage, IMessageProviderProps } from './types'
import { useTouchDevice } from '../../../_utils'
import MessageItem from './MessageItem.vue'

interface IProps {
  messages: Map<string, IMessage>
  maxMessages: number
  placement: IMessageProviderProps['placement']
  zIndex: number
}
const props = defineProps<IProps>()
const emit = defineEmits(['remove', 'pauseAll', 'resumeAll'])

const isHovering = ref(false)

// 设备检测
const { isTouchDevice } = useTouchDevice()

// 判断是否是顶部
const isTopPlacement = computed(() => {
  return props.placement?.startsWith('top') || !props.placement
})

// 消息列表，倒序排列
const messagesComputed = computed(() => {
  // 将 Map 的值转换为数组并按时间倒序排序
  const sorted = Array.from(props.messages.values())
    .sort((a, b) => b.addTime - a.addTime)

  // 截取最新三条
  return sorted.slice(0, props.maxMessages)
})

// 监听数组改变，如果变多了，则说明发送了新的通知，关闭消息叠加
watch(
  () => props.messages.size,
  (newSize, oldSize) => {
    if (newSize > oldSize) {
      if (isHovering.value) {
        handleHover(false)
      }
    }
  },
)

function getMsgStyles(index: number) {
  const zIndex = 9999 - index
  const scale = 1 - index * 0.1
  const offset = `${index * 10}px`
  return {
    wrapper: {
      [isTopPlacement.value ? 'top' : 'bottom']: offset,
      zIndex,
    },
    item: {
      transform: `scale(${scale})`,
      transformOrigin: isTopPlacement.value ? 'top center' : 'bottom center',
    },
  }
}

const computedMsgClass = computed(() => {
  return {
    wrapper: isHovering.value ? '' : 'absolute',
    item: isHovering.value ? '!scale-100' : '',
  }
})

function handleDeskHover(status: boolean) {
  if (isTouchDevice.value)
    return
  handleHover(status)
}

function handleMobileTap() {
  if (!isTouchDevice.value)
    return
  handleHover(!isHovering.value)
}

function handleHover(status: boolean) {
  isHovering.value = status
  if (isHovering.value) {
    emit('pauseAll')
  }
  else {
    emit('resumeAll')
  }
}

const computedPlacement = computed(() => {
  if (props.placement === 'top' || props.placement === 'bottom') {
    return ' justify-center'
  }
  if (props.placement === 'top-left' || props.placement === 'bottom-left') {
    return ' justify-start'
  }
  if (props.placement === 'top-right' || props.placement === 'bottom-right') {
    return ' justify-end'
  }
  return ' justify-center'
})

const transitionVars = computed(() => {
  if (!props.placement)
    return {}
  return {
    '--enter-offset': isTopPlacement.value ? '-30px' : '30px',
    '--leave-offset': isTopPlacement.value ? '-30px' : '30px',
  }
})
</script>

<template>
  <Teleport to="body">
    <!-- 消息层 -->
    <div class="pointer-events-none fixed left-0 top-0 z-1 h-full w-full flex px-5 py-10" :style="{ zIndex: props.zIndex }" :class="computedPlacement">
      <!-- 设置排列方式 -->
      <TransitionGroup
        name="msg" tag="div" class="relative h-full w-full flex flex-col items-center !md:w-388px"
        :style="transitionVars"
      >
        <!-- 设置移入移出 -->
        <div
          v-for="(msg, index) in messagesComputed" :key="msg.id" class="pointer-events-auto w-full pb-2"
          :class="[isTopPlacement ? 'pb-2' : 'pt-2', computedMsgClass.wrapper]" :style="getMsgStyles(index).wrapper"
          @mouseenter="handleDeskHover(true)" @mouseleave="handleDeskHover(false)" @click="handleMobileTap"
        >
          <!-- 设置缩放 -->
          <div class="w-full" :style="getMsgStyles(index).item" :class="computedMsgClass.item">
            <MessageItem :msg="msg" @remove="(e) => emit('remove', e)">
            </MessageItem>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
.safe-area-inset {
  padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
}

.msg-move,
.msg-enter-active,
.msg-leave-active {
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
  will-change: transform, opacity;
}

.msg-enter-from {
  opacity: 0;
  transform: translateY(var(--enter-offset)) scale(0.6);
}

.msg-enter-to {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.msg-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.msg-leave-to {
  opacity: 0;
  transform: translateY(var(--leave-offset)) scale(0.6);
}
</style>
