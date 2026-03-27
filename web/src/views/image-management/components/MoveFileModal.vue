<script lang='ts' setup>
import type { IDirectoryItem, IDirId } from '@apis/modules/image-management/type'
import { useToggleDialog } from '@/hooks/useToggleDialog'
import * as ionicons5 from '@vicons/ionicons5'
import { NIcon } from 'naive-ui'

interface IParams {
  targetType: 'file' | 'folder'
  targetId: IDirId
  parentId: IDirId
}
interface IThree {
  key: number
  label: string
  children?: IThree[] | null
  isLeaf?: boolean
  prefix: Component
  origin: IDirectoryItem
}
const emits = defineEmits(['success'])
const message = useMessage()
const isTreeLoading = ref(false)
const threes = ref<IThree[]>([])
const selectedKeys = ref<IDirId[]>([])
const defaultExpandedKeys = ref<IDirId[]>([])

const targetId = ref<IDirId>(null)
const targetType = ref<'file' | 'folder' | null>(null)

const targetTypeTextComputed = computed(() => {
  if (targetType.value === 'file') {
    return '图片'
  }
  else if (targetType.value === 'folder') {
    return '文件夹'
  }
  return ''
})

const { show, toggle, loading } = useToggleDialog<IParams>({
  open: (params) => {
    if (params) {
      targetId.value = params.targetId
      targetType.value = params.targetType
    }
    getTreeData()
  },
  close: () => { },
  reset: () => {
    targetId.value = null
    targetType.value = null
    threes.value = []
    selectedKeys.value = []
  },
})

defineExpose({ toggle })

async function handleSelect() {
  try {
    if (selectedKeys.value.length === 0) {
      return message.error('请选择要移动的文件夹')
    }
    if (targetType.value === null) {
      return message.error('传入数据异常，请刷新页面重试')
    }
    loading.value = true

    if (targetType.value === 'file') {
      await API.imageManagement.moveImages({
        dirId: selectedKeys.value[0],
        imagesId: targetId.value,
      })
    }
    else if (targetType.value === 'folder') {
      await API.imageManagement.moveDirectory({
        dirId: targetId.value,
        targetDirId: selectedKeys.value[0],
      })
    }
    message.success(`移动${targetTypeTextComputed.value}成功`)
    emits('success')
    toggle(false)
  }
  catch (error) {
    console.error('移动失败', error)
  }
  finally {
    loading.value = false
  }
}

// 获取树形结构
async function getTreeData(): Promise<IDirectoryItem[]> {
  return new Promise((resolve, reject) => {
    try {
      isTreeLoading.value = true
      API.imageManagement.getTreeDirectoryStructures().then(({ data }) => {
        isTreeLoading.value = false
        if (data.length === 0) {
          return resolve([])
        }
        // 构建树形结构
        threes.value = recursiveBuildTrees(data)
        defaultExpandedKeys.value = data.map(item => item.id as number)
        return resolve(data)
      })
    }
    catch (error) {
      console.error(error)
      isTreeLoading.value = false
      return reject(error)
    }
  })
}

// 树形结构生成器
function recursiveBuildTrees(
  items: IDirectoryItem[],
  disabledParam: boolean = false,
): IThree[] {
  return items
    .map((item) => {
      const disabled = targetType.value === 'folder' ? item.id === targetId.value || !!disabledParam : false
      const tree = {
        key: item.id as number,
        label: item.name,
        children: item.children && item.children.length > 0 ? recursiveBuildTrees(item.children, disabled) : [],
        isLeaf: false,
        disabled,
        prefix: () =>
          h(NIcon, null, {
            default: () => h(ionicons5.FolderOutline),
          }),
        origin: item,
      }
      return tree
    })
}

// 选中更新
function handleSelectedKeys(keys: IDirId[]) {
  console.info('选中更新', keys[0])
  selectedKeys.value = [keys[0] as IDirId]
}
</script>

<template>
  <NModal
    v-model:show="show" :title="`移动${targetTypeTextComputed}`" preset="dialog" positive-text="确认"
    negative-text="取消" :loading="loading" @positive-click="handleSelect"
  >
    <div class="flex flex-col gap-2">
      <div class="class">
        请选择要移动的文件夹
      </div>
      <BScrollbar
        :content-style="{
          maxHeight: '50vh',
          minHeight: '30vh',
        }"
      >
        <NTree
          v-if="!isTreeLoading" :default-expanded-keys="defaultExpandedKeys" :selected-keys="selectedKeys"
          class="w-full" :data="threes" :cancelable="false" expand-on-click
          @update:selected-keys="handleSelectedKeys"
        />
      </BScrollbar>
    </div>
  </NModal>
</template>
