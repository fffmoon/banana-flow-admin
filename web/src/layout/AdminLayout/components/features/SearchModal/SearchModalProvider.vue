<!--
 * @Author: Qing
 * @Description:
 * @Date: 2025-03-19 12:58:08
 * @LastEditTime: 2025-05-23 14:19:57
-->
<script setup lang="ts">
import { provide } from 'vue'
import SearchModal from './SearchModal.vue'
import { ISearchModalKey, SearchModalKey } from './useSearchModal'

defineOptions({
    displayName: 'SearchModalProvider',
})

const searchModalRef = ref<InstanceType<typeof SearchModal> | null>(null)

function openSearch() {
    searchModalRef.value?.toggleSearchModal()
}

const screen = useResponsive()

const context: ISearchModalKey = {
    openSearch,
}

provide(SearchModalKey, context)
</script>

<template>
    <slot />
    <SearchModal ref="searchModalRef" :is-mobile="screen.isMobile.value" />
</template>
