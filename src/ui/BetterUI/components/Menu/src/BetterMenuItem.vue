<script lang="ts" setup>
import type { CustomDropdownOption } from '@ui/BetterUI'
import type { IMenuItemProps, MenuOption } from './types'
import { renderLabelContent } from '@ui/BetterUI/_utils'
import { computed } from 'vue'
import BetterMenuNode from './BetterMenuNode.vue'
import { BetterMenuProvideKey } from './types'

interface IProps extends IMenuItemProps {
  item: MenuOption
}
const props = withDefaults(defineProps<IProps>(), {
  depth: 0,
})

// 获取全局展开状态和方法
const BetterMenuInject = inject(BetterMenuProvideKey)

const hasChildren = computed(() =>
  props.item.children && props.item.children.length > 0,
)
const isDropdownHovered = ref(false)

const isExpanded = computed(() => {
  if (!BetterMenuInject)
    return false
  return !!BetterMenuInject.expandedMap.value[props.item.key]
})

const menuItemStyle = computed(() => {
  // 每个项距离左边的距离
  let pdLeftStyle = ''
  if (props.depth === 0) {
    pdLeftStyle = `${props.rootIndent}px`
  }
  else {
    pdLeftStyle = props.collapsed ? '' : `${props.rootIndent + props.depth * props.rootIndent}px`
  }
  if (props.collapsed) {
    pdLeftStyle = ''
  }
  // 每个项距离右边的距离
  let pdRightStyle = '18px'
  if (props.collapsed) {
    pdRightStyle = ''
  }
  return {
    'padding-left': pdLeftStyle,
    'padding-right': pdRightStyle,
    'margin-bottom': '6px',
  }
})

const isActive = computed(() =>
  BetterMenuInject?.selectedKey.value === props.item.key,
)

// 获取高亮键集合
const isActiveFather = computed(() => {
  return BetterMenuInject?.activeKeys.value.has(props.item.key)
})

function handleItemClick(item: MenuOption) {
  if (item.disabled)
    return
  // 如果是折叠状态
  if (props.collapsed) {
    // console.log('折叠状态下的点击事件', item)
    if (item.children && item.children.length > 0) {
      return false
    }
    else {
      BetterMenuInject && BetterMenuInject.handleSelect(props.item.key, props.item)
    }
    return
  }
  BetterMenuInject && BetterMenuInject.handleSelect(props.item.key, props.item)
}

// 处理箭头点击
function handleArrowClick() {
  if (!BetterMenuInject)
    return
  BetterMenuInject.toggleExpandState(props.item.key)
}

// 计算子菜单高度
const childrenHeight = computed(() => {
  if (!props.item.children)
    return 0
  return props.item.children.length * 50
})

const childrenStyle = computed(() => ({
  '--children-height': `${childrenHeight.value}px`,
}))

function onSelect(key: string, item: MenuOption) {
  BetterMenuInject && BetterMenuInject.handleSelect(key, item)
}

function menuToDropdownOptions(menuOptions: MenuOption[] | undefined): CustomDropdownOption[] {
  if (!menuOptions)
    return []
  return menuOptions.map(item => ({
    key: item.key,
    label: item.label,
    children: item.children ? menuToDropdownOptions(item.children) : undefined,
  }))
}
</script>

<template>
  <div v-if="item.show !== false" class="menu-item-wrapper">
    <div
      class="menu-item" :class="{
        'is-active-father': isActiveFather,
        'is-active': isActive,
        'is-disabled': item.disabled,
        'has-children': hasChildren,
        'is-hover': isDropdownHovered,
      }" :style="menuItemStyle" @click.stop="handleItemClick(item)" @mouseenter="isDropdownHovered = true"
      @mouseleave="isDropdownHovered = false"
    >
      <!-- 如果是折叠状态下的菜单项 -->
      <template v-if="collapsed">
        <!-- 如果拥有子项则渲染下拉菜单 -->
        <template v-if="hasChildren">
          <NDropdown
            :options="menuToDropdownOptions(item.children)" placement="right-start" trigger="hover"
            @select="onSelect" @mouseenter="isDropdownHovered = true" @mouseleave="isDropdownHovered = false"
          >
            <div class="item-content item-content-collapsed">
              <div class="menu-icon-wrap">
                <span v-if="item.icon" class="menu-icon">
                  <component :is="item.icon" :size="collapsedIconSize" />
                </span>
              </div>
            </div>
          </NDropdown>
        </template>
        <!-- 如果没有子项则渲染提示 -->
        <template v-else>
          <NPopover trigger="hover" placement="right">
            <template #trigger>
              <div class="item-content item-content-collapsed">
                <div class="menu-icon-wrap">
                  <span v-if="item.icon" class="menu-icon">
                    <component :is="item.icon" :size="collapsedIconSize" />
                  </span>
                </div>
              </div>
            </template>
            <component :is="() => renderLabelContent(item.label)" />
          </NPopover>
        </template>
      </template>
      <!-- 如果是展开状态下的菜单项 -->
      <template v-else>
        <div class="item-content">
          <span v-if="item.icon" class="menu-icon">
            <component :is="item.icon" :size="collapsedIconSize" />
          </span>
          <span class="menu-label">
            <component :is="() => renderLabelContent(item.label)" />
          </span>
          <span v-if="hasChildren" class="menu-arrow" @click.stop="handleArrowClick">
            <div class="icon-base--md i-mdi-chevron-right" :class="isExpanded ? 'chevron-expanded' : ''"></div>
          </span>
        </div>
      </template>
    </div>

    <!-- 递归子菜单使用统一的MenuNode组件 -->
    <Transition name="slide">
      <div v-if="hasChildren && isExpanded && !collapsed" :style="childrenStyle">
        <BetterMenuNode
          v-for="child in item.children" :key="child.key" :item="child" :depth="depth + 1"
          :collapsed="collapsed" :root-indent="rootIndent" :collapsed-icon-size="collapsedIconSize" :indent="indent"
        />
      </div>
    </Transition>
  </div>
</template>

<style lang="scss" scoped>
.menu-item-wrapper {
  display: flex;
  flex-direction: column;
  position: relative;

  .menu-item {
    position: relative;
    cursor: pointer;
    transition: all 0.2s;
    border-radius: 4px;
    margin-bottom: 2px;
    color: var(--custom-menu-item-text-color);
    height: var(--custom-menu-item-height);
    background: transparent;

    &:not(.is-disabled) {
      &::before {
        content: "";
        position: absolute;
        top: 0;
        left: 8px;
        right: 8px;
        height: 100%;
        border-radius: 4px;
        transition: background-color 0.2s;
      }

      &.is-hover::before {
        background: var(--custom-hover-color);
        color: var(--custom-text-color-1);
      }

      &.is-hover .menu-icon {
        transform: scale(1.15);
      }
    }

    &.is-active-father .menu-label {
      color: var(--custom-primary-color);
    }

    &.is-active-father .menu-icon {
      color: var(--custom-primary-color);
    }

    &.is-active::before {
      background: var(--custom-primary-color-suppl) !important;
      color: var(--custom-primary-color);
    }

    &.is-active .menu-icon {
      color: var(--custom-primary-color);
    }

    &.is-active .menu-label {
      color: var(--custom-primary-color);
    }

    &.is-disabled {
      color: var(--custom-menu-item-text-color-disabled);
      opacity: 0.5;
      cursor: not-allowed;
    }

    .item-content {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      height: 100%;
      position: relative;
      z-index: 1;

      .menu-icon {
        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        transition-property: transform;
        transition-duration: 248ms;
      }

      .menu-label {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;

        a {
          outline: none;
          text-decoration: none;
          transition: color .3s cubic-bezier(.4,0,.2,1);
          color: var(--custom-menu-item-text-color);
        }
      }

      .menu-icon-wrap {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

    }

    .item-content-collapsed {
      justify-content: center;
    }

    .menu-arrow {
      margin-left: auto;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: transform 0.2s;
      color: var(--custom-menu-item-text-color);
    }

    &.is-active-father .menu-arrow {
      color: var(--custom-primary-color);
    }
  }

  /* 子菜单展开/折叠动画 */
  .slide-enter-active,
  .slide-leave-active {
    transition: max-height 0.3s cubic-bezier(0.32, 0.72, 0.38, 1), opacity 0.2s ease;
    overflow: hidden;
  }

  .slide-enter-from,
  .slide-leave-to {
    max-height: 0 !important;
    opacity: 0;
  }

  .slide-enter-to,
  .slide-leave-from {
    max-height: var(--children-height, 1000px);
    opacity: 1;
  }

  .icon-base--md {
    transform: rotate(0deg);
    transition: transform 0.3s ease;
  }

  .chevron-expanded {
    transform: rotate(90deg);
  }
}
</style>
