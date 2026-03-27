<!--
 * @Author: Qing
 * @Description:
 * @Date: 2025-04-01 15:53:08
 * @LastEditTime: 2025-04-08 15:50:12
-->
<script lang='ts' setup>
import type { ThemeVariable } from '../index.type'
import { NButton } from 'naive-ui'

interface IProps {
  rowData: ThemeVariable
}

defineProps<IProps>()
</script>

<template>
  <div class="wh-full flex items-center gap-4">
    <NTooltip trigger="hover">
      <template #trigger>
        <NButton v-copy="rowData.converted" size="small">
          <div class="i-mdi-content-copy"></div>
        </NButton>
      </template>
      复制转化数据 {{ rowData.converted }}
    </NTooltip>
  </div>
</template>

<style lang='scss' scoped></style>
