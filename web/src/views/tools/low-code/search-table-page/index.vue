<template>
    <div class="wh-full">
        <!-- 错误 -->
        <div v-if="errorState.isError" class="wh-full flex items-center justify-center">
            <NResult status="error" :title="errorState.title" :description="errorState.message">
                <template #footer v-if="errorState.canRetry">
                    <NButton type="primary" @click="fetchPageConfig">重试加载</NButton>
                </template>
            </NResult>
        </div>

        <!-- Loading -->
        <div v-else-if="pageLoading" class="wh-full flex items-center justify-center">
            <NSpin description="加载配置中..." size="large" />
        </div>

        <!-- 业务内容 -->
        <BSpace v-else-if="pageConfig" vertical class="wh-full">
            <NCard class="title">
                <DynamicSearchForm :config="pageConfig.search" v-model="searchParams" :loading="tableLoading"
                    @search="triggerSearch" @reset="resetSearch" />
            </NCard>

            <NCard class="body flex-1">
                <DynamicTable class="wh-full" v-model:loading="tableLoading" :config="pageConfig.table"
                    :query-params="activeQueryParams" />
            </NCard>
        </BSpace>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { useRoute } from 'vue-router';
import { NResult, NButton, NSpin, NCard } from 'naive-ui';
import DynamicSearchForm from './DynamicSearchForm.vue';
import DynamicTable from './DynamicTable.vue';

interface PageConfig {
    search: {
        fields: Array<{ key: string; defaultValue?: any;[key: string]: any }>;
        [key: string]: any;
    };
    table: Record<string, any>;
}

const route = useRoute();
const pageId = Array.isArray(route.query.id) ? route.query.id[0] : route.query.id;

const pageLoading = ref(false); // 页面级配置加载状态
const tableLoading = ref(false); // 表格数据加载状态

// 错误状态对象
const errorState = reactive({
    isError: false,
    title: '',
    message: '',
    canRetry: false
});

const pageConfig = ref<PageConfig | null>(null);
const searchParams = ref<Record<string, any>>({});
const activeQueryParams = ref<Record<string, any>>({});


// 初始化默认搜索参数
const initDefaultParams = (config: PageConfig) => {
    const params: Record<string, any> = {};
    if (config.search?.fields) {
        config.search.fields.forEach((f) => {
            if (f.defaultValue !== undefined && f.defaultValue !== null) {
                params[f.key] = f.defaultValue;
            }
        });
    }
    return params;
};

// 设置错误状态
const setError = (title: string, message: string, retry = false) => {
    errorState.isError = true;
    errorState.title = title;
    errorState.message = message;
    errorState.canRetry = retry;
    pageLoading.value = false; // 确保loading结束
};


const fetchPageConfig = async () => {
    // 1. 重置状态
    errorState.isError = false;
    pageConfig.value = null;

    // 2. 校验参数
    if (!pageId) {
        setError('参数缺失', 'URL 中缺少必须的 id 参数 (例如: ?id=123)', false);
        return;
    }

    // 3. 开始请求
    pageLoading.value = true;
    try {
        const res = await request({
            url: `/api/v1/pages/config/${pageId}`,
            method: 'GET',
        });

        if (res.data && res.success) {
            const config = res.data;
            // 赋值配置
            pageConfig.value = config;
            // 初始化参数
            searchParams.value = initDefaultParams(config);
            // 触发首次查询
            triggerSearch();
        } else {
            // 业务逻辑错误（如后端返回 false）
            setError('配置加载失败', res.data?.title || '服务端未返回有效配置', true);
        }
    } catch (error: any) {
        // 网络或代码异常
        console.error("加载配置异常", error);
        setError('网络请求错误', error.message || '无法连接到服务器', true);
    } finally {
        pageLoading.value = false;
    }
};

const triggerSearch = () => {
    activeQueryParams.value = { ...searchParams.value };
};

const resetSearch = () => {
    if (pageConfig.value) {
        searchParams.value = initDefaultParams(pageConfig.value);
        triggerSearch();
    }
};

onMounted(() => {
    fetchPageConfig();
});
</script>
