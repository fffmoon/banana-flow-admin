<!--
 * @Author: Qing
 * @Description:
 * @Date: 2025-05-08 16:41:06
 * @LastEditTime: 2025-05-09 16:49:16
-->
<script lang='ts' setup>
function preClick() {
  const imageInstace = imagePreview({
    src: 'https://njydict.ictshop.com.cn:9000/miniapp/tool-upload/2024/09/20/202409201313893_repeat_1726809226265__011191.png',
    alt: 'Example Image',
    objectFit: 'contain',
  })
  imageInstace.show()
}

function pre2Click(event: MouseEvent) {
  const target = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const imageInstace = imagePreview({
    src: 'https://njydict.ictshop.com.cn:9000/miniapp/tool-upload/2025/02/20/202502201051673_repeat_1740019863855__482504.jpg',
    alt: 'Example Image',
    objectFit: 'contain',
  })
  imageInstace.show(target)
}
</script>

<template>
  <FeatureDemo title="图片预览" content="良好的动画效果，具有移出动画；支持命令的方式调用">
    <BSpace vertical>
      <NCard title="DOM结构的方式使用">
        <BImagePreview
          width="150" height="150"
          src="https://njydict.ictshop.com.cn:9000/miniapp/tool-upload/2025/02/20/202502201323792_repeat_1740028986010__362763.jpg"
        >
        </BImagePreview>
      </NCard>
      <NCard title="命令的方式调用">
        <BSpace wrap>
          <NButton @click="preClick">
            点击预览
          </NButton>
          <NButton @click="pre2Click">
            从点击位置的动画效果
          </NButton>
        </BSpace>
      </NCard>
    </BSpace>
  </FeatureDemo>
</template>
