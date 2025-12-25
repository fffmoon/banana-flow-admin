<script lang='ts' setup>
const props = withDefaults(defineProps<IProps>(), {
  orientation: 'vertical',
})
const watermarkStore = useWatermarkStore()

interface IProps {
  orientation?: 'vertical' | 'horizontal'
}

const orientationInfo = computed(() => {
  const isVertical = props.orientation === 'vertical'
  return {
    isVertical,
    class: isVertical ? 'settings-vertical' : 'settings',
    justify: isVertical ? 'start' : 'space-between' as 'start' | 'space-between',
    align: isVertical ? 'start' : 'center' as 'start' | 'center',
  }
})
</script>

<template>
  <BSpace vertical align="start" class="w-full">
    <BSpace
      :vertical="orientationInfo.isVertical" :class="orientationInfo.class" :justify="orientationInfo.justify"
      :align="orientationInfo.align"
    >
      <div class="settings-label">
        全局水印
      </div>
      <div class="settings-content">
        <NSwitch
          :value="watermarkStore.watermarkConfig.show"
          @update:value="(status: boolean) => watermarkStore.toggleWatermark(status)"
        >
        </NSwitch>
      </div>
    </BSpace>
    <BSpace
      :vertical="orientationInfo.isVertical" :class="orientationInfo.class" :justify="orientationInfo.justify"
      :align="orientationInfo.align"
    >
      <div class="settings-label">
        时间戳显示
      </div>
      <div class="settings-content">
        <NSwitch
          :value="watermarkStore.watermarkConfig.timestamp" @update:value="(status: boolean) => {
            watermarkStore.watermarkConfig.timestamp = status
            !!status && watermarkStore.toggleWatermark(status)
          }"
        >
        </NSwitch>
      </div>
    </BSpace>
    <BSpace
      :vertical="orientationInfo.isVertical" :class="orientationInfo.class" :justify="orientationInfo.justify"
      :align="orientationInfo.align"
    >
      <div class="settings-label">
        自定义内容
      </div>
      <div class="settings-content">
        <NSwitch
          :value="watermarkStore.watermarkConfig.customContent"
          @update:value="(status: boolean) => watermarkStore.setCustomWatermarkContent(status)"
        >
        </NSwitch>
      </div>
    </BSpace>
    <BSpace
      :vertical="orientationInfo.isVertical" :class="orientationInfo.class" :justify="orientationInfo.justify"
      :align="orientationInfo.align"
    >
      <div class="settings-label">
        输入水印内容
      </div>
      <div class="settings-content">
        <NInput
          class="settings-input-box" :value="watermarkStore.watermarkConfig.content" type="text"
          placeholder="请输入水印内容" :disabled="!watermarkStore.watermarkConfig.customContent"
          @input="(t) => watermarkStore.watermarkConfig.content = t"
        />
      </div>
    </BSpace>
    <BSpace
      :vertical="orientationInfo.isVertical" :class="orientationInfo.class" :justify="orientationInfo.justify"
      :align="orientationInfo.align"
    >
      <div class="settings-label">
        字号大小
      </div>
      <div class="settings-content">
        <NInputNumber
          class="settings-input-box" :value="watermarkStore.watermarkConfig.fontSize" @update:value="(t) => {
            if (t) {
              watermarkStore.watermarkConfig.fontSize = t
            }
          }"
        />
      </div>
    </BSpace>
    <BSpace
      :vertical="orientationInfo.isVertical" :class="orientationInfo.class" :justify="orientationInfo.justify"
      :align="orientationInfo.align"
    >
      <div class="settings-label">
        字号颜色
      </div>
      <div class="settings-content">
        <NColorPicker v-model:value="watermarkStore.watermarkConfig.fontColor" class="settings-input-box" />
      </div>
    </BSpace>
    <BSpace
      :vertical="orientationInfo.isVertical" :class="orientationInfo.class" :justify="orientationInfo.justify"
      :align="orientationInfo.align"
    >
      <div class="settings-label">
        重置水印配置
      </div>
      <div class="settings-content">
        <NButton secondary strong type="error" @click="watermarkStore.resetWatermarkConfig()">
          重置
        </NButton>
      </div>
    </BSpace>
  </BSpace>
</template>

<style scoped lang="scss">
.settings-vertical {
  --at-apply: 'w-full';

  .settings-content {
    --at-apply: "w-full";
  }
}
</style>
