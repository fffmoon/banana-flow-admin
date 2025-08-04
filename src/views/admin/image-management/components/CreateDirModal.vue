<script lang='ts' setup>
import type { IDirId } from '@apis/modules/image-management/type'
import { useToggleDialog } from '@/hooks/useToggleDialog'

interface IParams {
  currentDirId: IDirId
  currentDirName: string
}
const emits = defineEmits([
  'success',
])

const message = useMessage()
// 当前目录ID
const currentDirId = ref<IDirId>(null)
// 当前目录名称
const currentDirName = ref('')
// 新的目录名称
const newDirName = ref('')

const {
  show,
  toggle,
  loading,
} = useToggleDialog<IParams>({
  open: (params) => {
    if (params) {
      if (params.currentDirId) {
        currentDirId.value = params.currentDirId
        currentDirName.value = params.currentDirName
      }
    }
  },
  close: () => { },
  reset: () => {
    newDirName.value = ''
    currentDirName.value = ''
    loading.value = false
  },
})

defineExpose({
  toggle,
})

// 新建目录
async function handleCreateDirectory() {
  try {
    loading.value = true
    await API.imageManagement.createDirectory({
      name: newDirName.value,
      dirId: currentDirId.value,
    })
    loading.value = false
    message.success('目录创建成功')
    emits('success')
    toggle(false)
    newDirName.value = ''
  }
  catch (error) {
    loading.value = false
    console.error('目录创建失败', error)
  }
}
</script>

<template>
  <NModal
    v-model:show="show" title="新建目录" preset="dialog" positive-text="确认" negative-text="取消" :loading="loading"
    @positive-click="handleCreateDirectory"
  >
    <div class="flex flex-col gap-2">
      <div>
        在<span class="text-[var(--custom-primary-color)]">{{ currentDirName }}</span>下新建文件夹
      </div>
      <NInput v-model:value="newDirName" placeholder="请输入目录名称" />
    </div>
  </NModal>
</template>
