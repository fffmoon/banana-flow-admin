<!-- components/Authority/index.vue -->
<script setup lang="ts">
import { useUserStore } from '@/store/modules/user'

const props = defineProps<{
    value: string
}>()

const userStore = useUserStore()
</script>

<template>
    <slot v-if="userStore.hasPerms(props.value)" />
</template>