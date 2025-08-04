<script lang='ts' setup>
const props = withDefaults(defineProps<IProps>(), {
  orientation: 'vertical',
})
const globalStore = useGlobalStore()
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
          :value="globalStore.getWatermarkOptions.show"
          @update:value="(status: boolean) => globalStore.toggleWatermark(status)"
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
          :value="globalStore.getWatermarkOptions.timestamp" @update:value="(status: boolean) => {
            globalStore.setWatermarkOptions({ timestamp: status });
            !!status && globalStore.toggleWatermark(status)
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
          :value="globalStore.getCustomWatermarkContent"
          @update:value="(status: boolean) => globalStore.setCustomWatermarkContent(status)"
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
          class="settings-input-box" :value="globalStore.getWatermarkOptions.content" type="text"
          placeholder="请输入水印内容" :disabled="!globalStore.getCustomWatermarkContent"
          @input="(t) => globalStore.setWatermarkOptions({ content: t })"
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
          class="settings-input-box" :value="globalStore.getWatermarkOptions.fontSize"
          @update:value="(t) => globalStore.setWatermarkOptions({ fontSize: t })"
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
        <NColorPicker
          class="settings-input-box" :default-value="globalStore.getWatermarkOptions.textColor"
          :actions="['confirm']" @confirm="(t) => globalStore.setWatermarkOptions({ textColor: t })"
        />
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
        <NButton secondary strong type="error" @click="globalStore.resetWatermarkConfig">
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
