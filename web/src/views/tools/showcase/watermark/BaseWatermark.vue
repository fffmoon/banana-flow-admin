<script lang='ts' setup>
const { t } = useLocale()

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
    <BSpace :vertical="orientationInfo.isVertical" :class="orientationInfo.class" :justify="orientationInfo.justify"
      :align="orientationInfo.align">
      <div class="settings-label">
        {{ t('watermark.global') }}
      </div>
      <div class="settings-content">
        <NSwitch :value="watermarkStore.watermarkConfig.show"
          @update:value="(status: boolean) => watermarkStore.toggleWatermark(status)">
        </NSwitch>
      </div>
    </BSpace>
    <BSpace :vertical="orientationInfo.isVertical" :class="orientationInfo.class" :justify="orientationInfo.justify"
      :align="orientationInfo.align">
      <div class="settings-label">
        {{ t('watermark.showTimestamp') }}
      </div>
      <div class="settings-content">
        <NSwitch :value="watermarkStore.watermarkConfig.timestamp" @update:value="(status: boolean) => {
          watermarkStore.watermarkConfig.timestamp = status
          !!status && watermarkStore.toggleWatermark(status)
        }">
        </NSwitch>
      </div>
    </BSpace>
    <BSpace :vertical="orientationInfo.isVertical" :class="orientationInfo.class" :justify="orientationInfo.justify"
      :align="orientationInfo.align">
      <div class="settings-label">
        {{ t('watermark.customContent') }}
      </div>
      <div class="settings-content">
        <NSwitch :value="watermarkStore.watermarkConfig.customContent"
          @update:value="(status: boolean) => watermarkStore.setCustomWatermarkContent(status)">
        </NSwitch>
      </div>
    </BSpace>
    <BSpace :vertical="orientationInfo.isVertical" :class="orientationInfo.class" :justify="orientationInfo.justify"
      :align="orientationInfo.align">
      <div class="settings-label">
        {{ t('watermark.inputContent') }}
      </div>
      <div class="settings-content">
        <NInput class="settings-input-box" :value="watermarkStore.watermarkConfig.content" type="text"
          :placeholder="t('watermark.inputPlaceholder')" :disabled="!watermarkStore.watermarkConfig.customContent"
          @input="(t) => watermarkStore.watermarkConfig.content = t" />
      </div>
    </BSpace>
    <BSpace :vertical="orientationInfo.isVertical" :class="orientationInfo.class" :justify="orientationInfo.justify"
      :align="orientationInfo.align">
      <div class="settings-label">
        {{ t('watermark.fontSize') }}
      </div>
      <div class="settings-content">
        <NInputNumber class="settings-input-box" :value="watermarkStore.watermarkConfig.fontSize" @update:value="(val) => {
          if (val) {
            watermarkStore.watermarkConfig.fontSize = val
          }
        }" />
      </div>
    </BSpace>
    <BSpace :vertical="orientationInfo.isVertical" :class="orientationInfo.class" :justify="orientationInfo.justify"
      :align="orientationInfo.align">
      <div class="settings-label">
        {{ t('watermark.fontColor') }}
      </div>
      <div class="settings-content">
        <NColorPicker v-model:value="watermarkStore.watermarkConfig.fontColor" class="settings-input-box" />
      </div>
    </BSpace>
    <BSpace :vertical="orientationInfo.isVertical" :class="orientationInfo.class" :justify="orientationInfo.justify"
      :align="orientationInfo.align">
      <div class="settings-label">
        {{ t('watermark.resetConfig') }}
      </div>
      <div class="settings-content">
        <NButton secondary strong type="error" @click="watermarkStore.resetWatermarkConfig()">
          {{ t('watermark.reset') }}
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