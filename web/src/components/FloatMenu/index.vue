<!--
 * @Author: Qing
 * @Description: 一个到处都可以用的浮动菜单
 * @Date: 2025-03-02 20:01:17
 * @LastEditTime: 2025-04-03 14:27:34
-->
<script lang='ts' setup>
import { themeDoms, themes, useThemeStore } from '@/theme'

const { toggleThemeAnimation } = useAnimation()
const themeStore = useThemeStore()
const { changeLocale, changeableLocales } = useLocale()

async function toggleTheme(event: MouseEvent) {
  const { clientX, clientY } = event
  toggleThemeAnimation({ clientX, clientY })
}

// 渲染图标
function renderIcon(themeId: string, color: string) {
  return () => {
    return h(
      'div',
      {
        class: [
          'h-[24px] w-[24px] border-[1px] rounded-[4px] border-solid p-[2px]',
          'transition-colors duration-200 ease-in-out',
          {
            'border-[var(--custom-primary-color)]': themeStore.themeColorId === themeId,
            'border-[var(--custom-border-color)]': themeStore.themeColorId !== themeId,
          },
        ],
      },
      [
        h('div', {
          class: 'h-full w-full rounded-[4px]',
          style: { backgroundColor: color },
        }),
      ],
    )
  }
}

// 主题下拉配置
const themesOptions = computed(() => {
  return themes.filter(item => item.showMenu).map((item) => {
    return {
      key: item.id,
      label: item.label,
      disabled: item.id === themeStore.themeColorId,
      icon: renderIcon(item.id, item.options[themeStore.themeMode].custom.primaryColor),
    }
  })
})

function getThemeIcon() {
  if (themeStore.userThemeMode) {
    const findRes = themeDoms.find(item => item.value === themeStore.themeMode)
    return findRes?.icon
  }
  return ''
}
</script>

<template>
  <div class="!z-10">
    <NFloatButtonGroup class="flex-center !flex-row" shape="square" position="relative">
      <!-- 切换主题 -->
      <NFloatButton @click="toggleTheme">
        <div class="icon-base--md" :class="getThemeIcon()" />
      </NFloatButton>
      <!-- 切换主题色 -->
      <NDropdown
        trigger="click" :options="themesOptions"
        @select="(key: string) => { themeStore.setThemeColorScheme(key) }"
      >
        <NFloatButton>
          <div class="icon-base--md i-mdi-palette" />
        </NFloatButton>
      </NDropdown>
      <!-- 切换语言 -->
      <NDropdown trigger="click" :options="changeableLocales" @select="(key: string) => changeLocale(key)">
        <NFloatButton>
          <div class="icon-base--md i-mdi-language"></div>
        </NFloatButton>
      </NDropdown>
    </NFloatButtonGroup>
  </div>
</template>
