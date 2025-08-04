<!-- 修复后的 Scrollbar 组件使用方式 -->
<script setup lang="ts">
function handleScroll(e) {
  console.log('当前滚动位置:', e)
}
</script>

<template>
  <FeatureDemo title="更好的滚动条" content="相比navieui，支持内容100%的继承">
    <div class="grid grid-cols-1 gap-x-3 gap-y-2 min-[600px]:grid-cols-2 !min-[1200px]:grid-cols-3">
      <NCard title="竖向滚动条，滚动条焦点显示">
        <BScrollbar :x-scrollable="false" trigger="hover" style="height: 400px" @scroll="handleScroll">
          <div v-for="i in 100" :key="i">
            <span v-for="j in 10" :key="j">填充内容</span> {{ i }}
          </div>
        </BScrollbar>
      </NCard>

      <NCard title="竖向滚动条，滚动条一直显示">
        <BScrollbar :x-scrollable="false" trigger="none" style="height: 400px" @scroll="handleScroll">
          <div v-for="i in 100" :key="i">
            <span v-for="j in 10" :key="j">填充内容</span> {{ i }}
          </div>
        </BScrollbar>
      </NCard>

      <NCard title="竖向滚动条，如果内容没有超出，滚动条隐藏">
        <BScrollbar :x-scrollable="false" trigger="none" style="height: 400px" @scroll="handleScroll">
          <div v-for="i in 2" :key="i">
            <span v-for="j in 10" :key="j">填充内容</span> {{ i }}
          </div>
        </BScrollbar>
      </NCard>

      <NCard title="横向滚动条，滚动条一直显示">
        <BScrollbar :x-scrollable="true" trigger="none" style="height: 400px" @scroll="handleScroll">
          <div v-for="i in 10" :key="i" class="flex flex-nowrap text-nowrap">
            <span v-for="j in 20" :key="j">填充内容</span> {{ i }}
          </div>
        </BScrollbar>
      </NCard>

      <NCard title="竖向滚动条，设置滚动条大小">
        <BScrollbar :size="2" :x-scrollable="false" trigger="none" style="height: 400px" @scroll="handleScroll">
          <div v-for="i in 100" :key="i">
            <span v-for="j in 10" :key="j">填充内容</span> {{ i }}
          </div>
        </BScrollbar>
      </NCard>
    </div>
  </FeatureDemo>
</template>
