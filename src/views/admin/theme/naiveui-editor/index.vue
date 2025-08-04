<!--
 * @Author: Qing
 * @Description:
 * @Date: 2025-01-26 21:22:26
 * @LastEditTime: 2025-04-27 09:15:37
-->
<script>
import { NThemeEditor } from 'naive-ui'
import { defineComponent } from 'vue'

export default defineComponent({
  components: {
    NThemeEditor,
  },
})
</script>

<template>
  <FeatureDemo title="naiveui的主题编辑器" content="点击下方的按钮出现主题编辑器">
    <NThemeEditor />
  </FeatureDemo>
</template>
