<script lang='ts' setup>
import type { IDirId } from '@apis/modules/image-management/type'
import { useToggleDialog } from '@/hooks/useToggleDialog'

interface IParams {
  targetId: IDirId
  currentName: string
}

const emits = defineEmits(['success'])

const message = useMessage()
const targetId = ref<IDirId>(null)
const newName = ref('')
const originalName = ref('')

const { show, toggle, loading } = useToggleDialog<IParams>({
  open: (params) => {
    if (params) {
      targetId.value = params.targetId
      newName.value = params.currentName
      originalName.value = params.currentName
    }
  },
  close: () => { },
  reset: () => {
    originalName.value = ''
    newName.value = ''
    targetId.value = null
    loading.value = false
  },
})

defineExpose({ toggle })

async function handleRename() {
  try {
    loading.value = true
    await API.imageManagement.renameDirectory({
      dirId: targetId.value,
      name: newName.value,
    })
    message.success('重命名成功')
    emits('success')
    toggle(false)
  }
  catch (error) {
    console.error('重命名失败', error)
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <NModal
    v-model:show="show"
    title="重命名目录"
    preset="dialog"
    positive-text="确认"
    negative-text="取消"
    :loading="loading"
    @positive-click="handleRename"
  >
    <div class="flex flex-col gap-2">
      <div>当前名称为：<span class="text-[var(--custom-primary-color)]">{{ originalName }}</span></div>
      <NInput v-model:value="newName" :placeholder="originalName" />
    </div>
  </NModal>
</template>
