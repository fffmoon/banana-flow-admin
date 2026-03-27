<template>
    <NForm v-if="config?.fields" inline label-placement="left" label-width="auto" :show-feedback="false" class="flex flex-wrap gap-y-4">
        <!-- 动态字段渲染 -->
        <NFormItem v-for="field in config.fields" :key="field.key" :label="field.label">
            <!-- 输入框 -->
            <NInput v-if="field.type === 'Input'" :value="modelValue[field.key] ?? null"
                @update:value="(val) => handleFieldUpdate(field.key, val)" :placeholder="field.placeholder"
                :disabled="loading" clearable @keyup.enter="emit('search')" />

            <!-- 下拉框 -->
            <NSelect v-if="field.type === 'Select'" :value="modelValue[field.key] ?? null"
                @update:value="(val) => handleFieldUpdate(field.key, val)" :options="field.options"
                :placeholder="field.placeholder" :disabled="loading" class="w-[180px]" clearable />

            <!-- DOTO: 其他类型扩展... -->
        </NFormItem>

        <!-- 按钮区 -->
        <NFormItem style="margin-left: auto;">
            <BSpace>
                <NButton type="primary" :loading="loading" @click="emit('search')">
                    搜索
                </NButton>
                <NButton :disabled="loading" @click="emit('reset')">
                    重置
                </NButton>
            </BSpace>
        </NFormItem>
    </NForm>
</template>

<script setup lang="ts">

// 接收父组件传递的值
const props = defineProps<{
    config: { fields: any[] };
    modelValue: Record<string, any>;
    loading?: boolean;
}>();

const emit = defineEmits(['update:modelValue', 'search', 'reset']);

const handleFieldUpdate = (key: string, value: any) => {
    const newValue = { ...props.modelValue, [key]: value };
    emit('update:modelValue', newValue);
};
</script>