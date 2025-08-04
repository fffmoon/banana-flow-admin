<script lang='ts' setup>
import type { IDirectoryItem, IDirId } from '@apis/modules/image-management/type'
import type { DataTableColumns, UploadFileInfo } from 'naive-ui'
import type { IFileActionType } from 'types/modules/management'

import { onMounted, reactive, ref } from 'vue'
import CreateDirModal from './components/CreateDirModal.vue'
import MoveFileModal from './components/MoveFileModal.vue'
import RenameDirModal from './components/RenameDirModal.vue'
import RenameFileModal from './components/RenameFileModal.vue'
import TableOperation from './components/TableOperation.vue'
import TableThumbnail from './components/TableThumbnail.vue'

const dialog = useDialog()
const message = useMessage()

interface IBreadcrumb {
  name: string
  id: IDirId
}

interface IFormData {
  searchName: string
}

interface IFetchParams {
  dirId?: IDirId
  searchName?: string
  page?: number
}

// 上传相关状态
const uploading = ref(false)
// 目录操作相关状态
const createDirModalRef = ref<typeof CreateDirModal | null>(null)
const renameDirModalRef = ref<typeof RenameDirModal | null>(null)
const renameFileModalRef = ref<typeof RenameFileModal | null>(null)
const moveFileModalRef = ref<typeof MoveFileModal | null>(null)
// 根目录
const originalDir: { name: string, id: IDirId } = { name: '根目录', id: null }
// 表格载入状态
const isLoading = ref(false)
// 表格载入错误状态
const isError = ref(false)
// 当前目录
const currentDirId = ref(originalDir.id)
// 当前目录的面包屑
const breadcrumbs = ref<IBreadcrumb[]>([])
// 列表数据
const dataList = ref<IDirectoryItem[]>([])

// #region ➤ 头部表单
// ================================================

// 表格数据
const formData = reactive<IFormData>({
  searchName: '',
})

// 搜索
function handleSearch() {
  fetchData({
    page: 1,
  })
}

// 重置
function handleReset() {
  fetchData({
    searchName: '',
    page: 1,
  })
}

// #endregion 头部表单

// #region ➤ 顶部工具栏
// ================================================
// #
// Qing 2025-04-01 17:06:22
// ================================================

// 上传处理
async function handleUpload({ file }: { file: UploadFileInfo }) {
  try {
    uploading.value = true
    await API.imageManagement.uploadImages({
      dirId: currentDirId.value,
      file: file.file as File,
    })
    message.success('上传成功')
    fetchData()
  }
  catch (error) {
    console.error('上传失败', error)
  }
  finally {
    uploading.value = false
  }
}

function openNewDirectory() {
  createDirModalRef.value?.toggle(true, { currentDirId, currentDirName: breadcrumbs.value.find(c => c.id === currentDirId.value)?.name })
}

// #endregion 顶部工具栏

// #region ➤ 面包屑
// ================================================
// #
// Qing 2025-04-01 17:07:46
// ================================================

async function updateBreadcrumbs(id: IDirId) {
  const { data } = await API.imageManagement.getDirectoryStructureById(id as number)
  breadcrumbs.value = [...data].reverse()
}

// 面包屑点击处理
function handleBreadcrumbClick(itemId: IDirId) {
  fetchData({ dirId: itemId })
}

// #endregion 面包屑

// #region ➤ 中间表格
// ================================================

// 表格列
const columns: DataTableColumns<IDirectoryItem> = [
  {
    title: '缩略图',
    key: 'thumbnail',
    width: 90,
    render: (row) => {
      return h(TableThumbnail, {
        rowData: row,
      })
    },
  },
  { title: '名称', key: 'name', minWidth: 200 },
  {
    title: '类型',
    key: 'type',
    width: 80,
    render: (row) => {
      return row.type === 'folder' ? '文件夹' : '文件'
    },
  },
  { title: '创建日期', key: 'date', minWidth: 100 },
  {
    title: '操作',
    key: 'actions',
    minWidth: 180,
    render: row => h(TableOperation, {
      rowData: row,
      onAction: (type, data) => handleTableAction(type, data),
    }),
  },
]

// 表格列点击
function rowProps(row: IDirectoryItem) {
  return {
    style: 'cursor: pointer;',
    onClick: () => {
      console.info('用户点击了', row.name)
      if (row.type === 'folder') {
        fetchData({ dirId: row.id })
      }
    },
  }
}

// 处理操作栏的工厂函数
function handleTableAction(type: IFileActionType, rowData: IDirectoryItem) {
  switch (type) {
    case 'open':
      // 处理打开逻辑
      fetchData({ dirId: rowData.id })
      break
    case 'renameFolder':
      // 处理重命名逻辑
      renameDirModalRef.value?.toggle(true, { targetId: rowData.id, currentName: rowData.name })
      break
    case 'renameFile':
      // 处理重命名逻辑
      renameFileModalRef.value?.toggle(true, { targetId: rowData.id, currentName: rowData.name })
      break
    case 'delete':
      // 处理删除逻辑
      confirmDelete(rowData.id)
      break
    case 'moveFolder':
      console.log('moveFolder')
      moveFileModalRef.value?.toggle(true, { targetId: rowData.id, targetType: 'folder' })
      break
    case 'moveFile':
      console.log('moveFile')
      moveFileModalRef.value?.toggle(true, { targetId: rowData.id, targetType: 'file' })
      break
  }
}

// 删除
function confirmDelete(id: IDirId) {
  dialog.warning({
    title: '删除确认',
    content: '确定要删除此项吗？',
    positiveText: '确认删除',
    negativeText: '取消',
    async onPositiveClick() {
      try {
        const isFolder = dataList.value.find(item => item.id === id)?.type === 'folder'

        if (isFolder) {
          await API.imageManagement.deleteDirectory(id as number)
        }
        else {
          await API.imageManagement.deleteImages(id as number)
        }

        dataList.value = dataList.value.filter(item => item.id !== id)
        message.success('删除成功')
      }
      catch (error) {
        console.error('删除失败', error)
      }
    },
  })
}

// #endregion 中间表格

// #region ➤ 尾部分页
// ================================================

const pagination = reactive({
  page: 1,
  pageSize: 10,
  showSizePicker: true,
  pageSizes: [10, 20, 50],
  itemCount: 0,
  prefix: info => `共 ${info.itemCount} 条`,
  pageCount: 0,
  onChange: (newPage: number) => {
    pagination.page = newPage
    fetchData({ page: newPage })
  },
  onUpdatePageSize: (newPageSize: number) => {
    pagination.pageSize = newPageSize
    pagination.page = 1
    fetchData()
  },
})

// #endregion 尾部分页

// #region ➤ 表格数据获取
// ================================================
// #
// Qing 2025-04-01 17:05:18
// ================================================

let requestId: string = ''

function fetchData(params?: IFetchParams) {
  // 初始化值
  isLoading.value = true
  dataList.value = []
  isError.value = false
  // 设置本次请求的id
  requestId = generatedId()
  const currentId = requestId
  // 同步本地状态
  if (params?.dirId !== undefined)
    currentDirId.value = params.dirId
  if (params?.searchName !== undefined)
    formData.searchName = params.searchName
  if (params?.page !== undefined)
    pagination.page = params.page
  // 获取数据
  API.imageManagement.getDirectoryStructure({
    dirId: currentDirId.value,
    searchName: formData.searchName,
    page: pagination.page,
    pageSize: pagination.pageSize,
  }).then(({ data }) => {
    if (requestId !== currentId)
      return
    isLoading.value = false
    // 设置列表数据
    dataList.value = data.data
    // 设置分页信息
    pagination.page = data.pagination.page
    pagination.itemCount = data.pagination.total
    pagination.pageCount = data.pagination.totalPages
    // 更新面包屑
    updateBreadcrumbs(currentDirId.value)
  }).catch((error) => {
    console.error(error)
    if (requestId !== currentId)
      return
    isLoading.value = false
    isError.value = true
  })
}

async function initRootId() {
  const { data } = await API.imageManagement.getRootDirectoryId()
  originalDir.id = data
  currentDirId.value = data
  fetchData()
}

onMounted(() => {
  initRootId()
})

// #endregion 表格数据获取
</script>

<template>
  <BSpace vertical class="wh-full">
    <NCard class="title">
      <NForm
        class="flex flex-wrap gap-y-[--space-md]" inline label-width="auto" :show-feedback="false"
        label-placement="left" :model="formData"
      >
        <NFormItem label="名称">
          <NInput
            v-model:value="formData.searchName" placeholder="输入名称" :disabled="isLoading"
            @keyup.enter="handleSearch"
          />
        </NFormItem>
        <NFormItem :style="{ marginLeft: 'auto' }">
          <BSpace>
            <NButton type="primary" :disabled="isLoading" :loading="isLoading" @click="handleSearch">
              搜索
            </NButton>
            <NButton type="default" :disabled="isLoading" @click="handleReset">
              重置
            </NButton>
          </BSpace>
        </NFormItem>
      </NForm>
    </NCard>

    <NCard class="body flex-1">
      <BSpace vertical class="wh-full">
        <BSpace>
          <NButton type="primary" @click="openNewDirectory">
            <template #icon>
              <i class="i-mdi-folder-plus" />
            </template>新建目录
          </NButton>
          <NUpload :show-file-list="false" :disabled="uploading" @change="handleUpload">
            <NButton type="primary" :loading="uploading">
              <template #icon>
                <i class="i-mdi-upload" />
              </template>上传图片
            </NButton>
          </NUpload>
        </BSpace>
        <NAlert
          class="h-32px w-full flex items-center rounded-[var(--custom-border-radius)] px-8px" type="info"
          bordered :show-icon="false"
        >
          <NBreadcrumb>
            <NBreadcrumbItem v-for="item in breadcrumbs" :key="item.id" @click="handleBreadcrumbClick(item.id)">
              <template #separator>
                <div class="icon-base--sm i-mdi-chevron-right"></div>
              </template>
              <div class="wh-full line-height-100%">
                {{ item.name }}
              </div>
            </NBreadcrumbItem>
          </NBreadcrumb>
        </NAlert>
        <div class="flex-1 overflow-hidden">
          <NDataTable
            v-if="!isError" :columns="columns" :data="dataList" :row-props="rowProps"
            :pagination="pagination" :loading="isLoading" :bordered="false" :style="{ height: `100%` }" remote flex-height
          />
          <!-- 数据加载失败 -->
          <div v-else class="flex flex-1 items-center justify-center">
            <NEmpty description="数据加载失败">
              <template #extra>
                <NButton type="primary" @click="fetchData">
                  重试
                </NButton>
              </template>
            </NEmpty>
          </div>
        </div>
      </BSpace>
    </NCard>

    <!-- 创建目录模态框 -->
    <CreateDirModal ref="createDirModalRef" @success="fetchData"></CreateDirModal>

    <!-- 重命名目录模态框 -->
    <RenameDirModal ref="renameDirModalRef" @success="fetchData"></RenameDirModal>

    <!-- 重命名文件模态框 -->
    <RenameFileModal ref="renameFileModalRef" @success="fetchData"></RenameFileModal>

    <!-- 移动文件/目录模态框 -->
    <MoveFileModal ref="moveFileModalRef" @success="fetchData"></MoveFileModal>
  </BSpace>
</template>

<style lang='scss' scoped>
// .image-container {}
</style>
