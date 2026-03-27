<template>
    <BSpace vertical class="wh-full">
        <div class="flex-1 overflow-hidden">
            <NDataTable remote flex-height :bordered="false" style="height: 100%" :columns="columns" :data="data"
                :loading="loading" striped :pagination="pagination" :row-key="(row) => row.id || row.key"
                @update:page="handlePageChange" @update:page-size="handlePageSizeChange" />
        </div>
    </BSpace>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, h } from 'vue';
import { NTag, NButton, NSpace, NPopconfirm, useDialog } from 'naive-ui';
import axios from 'axios';


const message = useMessage();
const dialog = useDialog();

const props = defineProps<{
    config: { apiUrl: string; columns: any[]; rowActions?: any[]; pk?: string };
    queryParams: Record<string, any>;
    loading: boolean;
}>();

const emit = defineEmits(['update:loading', 'reload']);

// 本地数据状态
const data = ref([]);
const pagination = ref({
    page: 1,
    pageSize: 10,
    itemCount: 0,
    showSizePicker: true,
    pageSizes: [10, 20, 50]
});


// 获取行主键，默认为 id
const getRowKey = (row: any) => row[props.config.pk || 'id'] || row.id;

// 构建 Columns
const columns = computed(() => {
    if (!props.config?.columns) return [];

    const cols = props.config.columns.map((col: any) => ({
        title: col.title,
        key: col.key,
        width: col.width ? Number(col.width) : undefined,
        ellipsis: true,
        render: (row: any) => {
            if (col.renderType === 'tag') {
                const typeMap: any = { '运行': 'success', '报警': 'error', '维护': 'warning', '停机': 'default' };
                return h(NTag, { type: typeMap[row[col.key]] || 'default', bordered: false }, { default: () => row[col.key] });
            }
            // 可以扩展 time 格式化等
            return row[col.key];
        }
    }));

    // 处理操作列
    if (props.config.rowActions && props.config.rowActions.length > 0) {
        cols.push({
            title: '操作',
            key: 'actions',
            width: 150,
            fixed: 'right',
            render(row: any) {
                return h(NSpace, {}, {
                    default: () => props.config.rowActions!.map((action: any) => {
                        // 渲染按钮
                        const btn = h(NButton, {
                            size: 'small',
                            type: action.type || 'default',
                            text: true,
                            // 如果不是需要二次确认的操作，直接绑定点击
                            onClick: action.needConfirm ? undefined : () => handleAction(action, row)
                        }, { default: () => action.label });

                        // 如果需要二次确认 (例如删除)
                        if (action.needConfirm) {
                            return h(NPopconfirm, {
                                onPositiveClick: () => handleAction(action, row)
                            }, {
                                trigger: () => btn,
                                default: () => action.confirmText || '确认执行此操作吗？'
                            });
                        }
                        return btn;
                    })
                });
            }
        });
    }
    return cols;
});

const fetchData = async () => {
    emit('update:loading', true);
    try {
        const params = {
            page: pagination.value.page,
            size: pagination.value.pageSize,
            ...props.queryParams
        };
        const res = await axios.get(props.config.apiUrl, { params });
        
        // 后端返回结构是 APIResponse，数据在 .data 属性里
        const result = res.data.data; 
        
        if (result) {
            // 兼容 items 和 list
            data.value = result.items || result.list || [];
            // 兼容 total 和 itemCount
            pagination.value.itemCount = result.total ?? result.itemCount ?? 0;
        }
    } catch (err) {
        message.error('数据加载失败');
    } finally {
        emit('update:loading', false);
    }
};

watch(() => props.queryParams, () => {
    pagination.value.page = 1;
    fetchData();
}, { deep: true });

const handlePageChange = (page: number) => {
    pagination.value.page = page;
    fetchData();
};

const handlePageSizeChange = (pageSize: number) => {
    pagination.value.pageSize = pageSize;
    pagination.value.page = 1;
    fetchData();
};
// 核心：处理操作逻辑
const handleAction = async (action: any, row: any) => {
    console.log("Action Triggered:", action, row);

    // 1. 如果配置了 API，则发起 HTTP 请求 (如删除、状态变更)
    if (action.api) {
        try {
            emit('update:loading', true);

            // 替换 URL 中的变量，例如 /api/v1/devices/{id} -> /api/v1/devices/123
            let apiUrl = action.api;
            const matches = apiUrl.match(/\{(.+?)\}/g);
            if (matches) {
                matches.forEach((m: string) => {
                    const key = m.slice(1, -1); // 去掉 {}
                    apiUrl = apiUrl.replace(m, row[key] || '');
                });
            }

            const method = (action.method || 'GET').toLowerCase();

            // 发起请求
            await axios({ method, url: apiUrl });

            message.success('操作成功');
            fetchData(); // 刷新表格
        } catch (error) {
            console.error(error);
            message.error('操作失败');
        } finally {
            emit('update:loading', false);
        }
    }

    // 2. 如果配置了 Event，则仅仅是前端路由跳转或打开弹窗
    else if (action.event === 'viewDetail') {
        // 简单实现：弹窗显示详情 JSON
        dialog.info({
            title: '详情',
            content: () => h('pre', { style: 'max-height: 400px; overflow: auto;' }, JSON.stringify(row, null, 2)),
            positiveText: '关闭'
        });
    }
};


onMounted(() => {
    if (props.config?.apiUrl) fetchData();
});

defineExpose({ fetchData });
</script>