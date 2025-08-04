import type { FlatMenuOption, MenuOption } from './types'

// 生成父菜单映射表 - 支持所有类型
export function flattenMenuOptions(
  options: MenuOption[],
  currentParents: string[] = [],
  depth: number = 0,
): FlatMenuOption[] {
  const flatOptions: FlatMenuOption[] = []

  for (const option of options) {
    // 跳过divider类型（根据接口定义divider有key属性）
    if (option.type === 'divider') {
      flatOptions.push({
        ...option,
        parents: [...currentParents],
        depth,
      })
      continue
    }

    // 提取基础属性
    const { key, type = 'menu', label, ...rest } = option as MenuOption

    // 创建扁平化的菜单项
    const flatOption: FlatMenuOption = {
      key,
      type,
      label,
      ...rest, // 保留所有其他属性
      parents: [...currentParents], // 克隆当前父级路径
      depth,
    }

    // 添加到结果数组
    flatOptions.push(flatOption)

    // 处理子菜单
    let children: MenuOption[] = []
    if (type === 'group') {
      children = option.children || []
    }
    else if (option.children) {
      children = option.children
    }

    // 递归处理子菜单
    if (children.length > 0) {
      const newParents = [...currentParents, key] // 添加当前项到父级路径
      const childOptions = flattenMenuOptions(children, newParents, depth + 1)
      flatOptions.push(...childOptions)
    }
  }

  return flatOptions
}

// 根据 key 查找菜单项 - 支持所有类型
export function findMenuItemByKey(
  options: MenuOption[],
  key: string,
): MenuOption | null {
  for (const item of options) {
    if (item.type === 'divider')
      continue

    if (item.key === key) {
      return item
    }

    let children: MenuOption[] = []

    if (item.type === 'group') {
      children = item.children || []
    }
    else {
      children = item.children || []
    }

    if (children.length > 0) {
      const found = findMenuItemByKey(children, key)
      if (found)
        return found
    }
  }

  return null
}
