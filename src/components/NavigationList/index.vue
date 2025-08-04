<!--
 * @Author: Qing
 * @Description: 一个文件集合列表，通常用来陈列路由
 * @Date: 2025-04-02 09:50:22
 * @LastEditTime: 2025-04-15 14:43:48
-->
<script lang="ts" setup>
import { defineProps } from 'vue'
import { useRouter } from 'vue-router'

interface NavigationItem {
  name: string
  path: string
}

interface Props {
  title?: string // 标题
  items: NavigationItem[] // 导航项列表
  basePath?: string // 基础路由路径
  customNavigation?: boolean // 是否自定义导航
  relativePath?: string // 相对路径前缀，如 './'
  onItemClick?: (item: NavigationItem) => void // 点击回调
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  basePath: '',
  items: () => [],
  relativePath: './',
  customNavigation: false,
})

const router = useRouter()

// 点击列表项时触发
function handleClick(item: NavigationItem) {
  if (props.customNavigation) {
    // 如果是自定义导航，则调用回调
    props.onItemClick?.(item)
  }
  else {
    // 默认导航逻辑
    const route = item.path
      .replace(new RegExp(`^${props.relativePath}`), '') // 移除指定的相对路径前缀
      .replace('/index.vue', '')
    const path = props.basePath
      ? `${props.basePath}/${route}`
      : route
    router.push({ path })
  }
}
</script>

<template>
  <div class="navigation-container">
    <h1
      v-if="title"
      class="title"
    >
      {{ title }}
    </h1>

    <ul class="list">
      <li
        v-for="item in items"
        :key="item.name"
        class="item"
        @click="handleClick(item)"
      >
        {{ item.name }}
      </li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
  .navigation-container {
    box-sizing: border-box;
    padding: 0 8vh 8vh;
    width: 100%;
    height: 100vh;
    background-color: var(--custom-card-color);
    box-shadow: var(--custom-box-shadow-1);

    .title {
      height: 12vh;
      line-height: 12vh;
      font-size: 24px;
      color: var(--custom-text-color-1);
      text-align: center;
    }

    .list {
      height: 80vh;
      padding: 0;
      list-style-type: none;
      overflow: auto;
    }

    .item {
      box-sizing: border-box;
      padding: 0 20px;
      border-bottom: 1px solid var(--custom-border-color);
      width: 100%;
      height: 60px;
      line-height: 60px;
      transition: background-color 0.3s;
      cursor: pointer;
      background-color: var(--custom-body-color);

      &:hover {
        background-color: var(--custom-hover-color);
      }
    }
  }
</style>
