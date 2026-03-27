<script lang='ts' setup>

</script>

<template>
  <FeatureDemo title="弹出信息" content="良好的性能优化">
    <BSpace vertical>
      <NCard :bordered="false" title="不同的触发方式">
        <BSpace>
          <BPopover trigger="click" placement="bottom">
            <template #trigger>
              <NButton>
                点击触发
              </NButton>
            </template>
            <div>一只香蕉的速度一只香蕉的速度</div>
          </BPopover>
          <BPopover trigger="hover" placement="bottom">
            <template #trigger>
              <NButton>
                悬浮触发
              </NButton>
            </template>
            <div>一只香蕉的速度一只香蕉的速度</div>
          </BPopover>
        </BSpace>
      </NCard>

      <NCard :bordered="false" title="弹出位置">
        参考下拉菜单
      </NCard>

      <NCard :bordered="false" title="来自naiveui的弹出信息组件">
        <NPopover trigger="click">
          <template #trigger>
            <NButton>点击</NButton>
          </template>
          <span>I wish they all could be California girls</span>
        </NPopover>
      </NCard>
    </BSpace>
  </FeatureDemo>
</template>

<style lang='scss' scoped>
.dropdown-content {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(5, 1fr);
  gap: 12px;
}
</style>
