import type { IRouteDataRaw } from 'types/vue-router'

/**
 * 将扁平列表转换为树形结构
 */
export function listToTree(list: IRouteDataRaw[]): IRouteDataRaw[] {
  const map: Record<string, IRouteDataRaw> = {}
  const roots: IRouteDataRaw[] = []

  // 1. 初始化 map，并重置 children
  list.forEach((item) => {
    // 浅拷贝对象，避免修改原始引用，且必须初始化 children 为 []
    map[item.id] = { ...item, children: [] }
  })

  // 2. 组装树
  list.forEach((item) => {
    const node = map[item.id]
    if (item.parentId && map[item.parentId]) {
      map[item.parentId].children!.push(node)
    }
    else {
      roots.push(node)
    }
  })

  // 3. 排序 (如果有 sort 字段)
  const sortFunc = (a: IRouteDataRaw, b: IRouteDataRaw) => (a.sort || 0) - (b.sort || 0)

  const sortTree = (nodes: IRouteDataRaw[]) => {
    nodes.sort(sortFunc)
    nodes.forEach((node) => {
      if (node.children && node.children.length > 0) {
        sortTree(node.children)
      }
      else {
        // 如果没有子节点，为了 NDataTable 显示美观（不显示展开图标），可以设为 undefined
        node.children = undefined
      }
    })
  }

  sortTree(roots)
  return roots
}
