<!--
  * @Author: Qing
  * @Description:
  * @Date: 2024-06-21 21:14:35
 * @LastEditTime: 2025-07-21 09:49:36
-->
<script lang="ts" setup>
const watermark = {
  show: false,
  fontSize: 16,
  lineHeight: 16,
  width: 200,
  height: 200,
  xOffset: 0,
  yOffset: 30,
  rotate: -20,
  content: '默认水印',
}
</script>

<template>
  <NWatermark
    v-if="watermark.show"
    :content="watermark.content"
    cross
    fullscreen
    :font-size="watermark.fontSize"
    :line-height="watermark.lineHeight"
    :width="watermark.width"
    :height="watermark.height"
    :x-offset="watermark.xOffset"
    :y-offset="watermark.yOffset"
    :rotate="watermark.rotate"
  />
</template>
