<script lang="ts" setup>
import type { IMenuItemProps, MenuOption } from './types'
import { renderLabelContent } from '@ui/BetterUI/_utils'
import { computed } from 'vue'
import BetterMenuNode from './BetterMenuNode.vue'

interface IProps extends IMenuItemProps {
  item: MenuOption
}
const props = withDefaults(defineProps<IProps>(), {
  depth: 0,
})

const indentStyle = computed(() => ({
  paddingLeft: props.collapsed ? 0 : `${props.depth * props.rootIndent}px`,
}))
</script>

<template>
  <div v-if="item.show !== false" class="menu-group-wrapper" :style="indentStyle">
    <!-- 分组标题 -->
    <div class="menu-group">
      <span v-if="!collapsed" class="menu-group-label">
        <component :is="() => renderLabelContent(item.label)" />
      </span>

      <!-- 分组永远都是展开的 -->
      <span class="menu-arrow">
        <div class="icon-base--md i-mdi-chevron-down"></div>
      </span>
    </div>

    <!-- 分组内容 -->
    <div v-if="item.children && item.children.length > 0" class="menu-children">
      <BetterMenuNode
        v-for="child in item.children" :key="child.key" :item="child" :depth="depth + 1"
        :collapsed="collapsed" :root-indent="rootIndent" :collapsed-icon-size="collapsedIconSize" :indent="indent"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.menu-group-wrapper {
  display: flex;
  flex-direction: column;
  margin-bottom: 8px;
}

.menu-group {
  padding: 8px 12px;
  font-size: 12px;
  color: var(--custom-menu-group-text-color);
  text-transform: uppercase;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 8px;

  .menu-group-icon {
    display: flex;
    align-items: center;
    color: var(--custom-menu-item-text-color);
  }

  .menu-arrow {
    margin-left: auto;
    cursor: pointer;
    color: var(--custom-menu-group-text-color);
  }
}

.menu-children {
  padding-left: v-bind('rootIndent > 0 ? `${rootIndent}px` : "0"');
}
</style>
