import { inject } from 'vue'

export interface ISearchModalKey {
  openSearch: () => void
}

// 消息的注入
export const SearchModalKey: InjectionKey<ISearchModalKey> = Symbol('SearchModalKey')

export function useSearchModal() {
  const context = inject(SearchModalKey)

  if (!context) {
    throw new Error('useSearchModal() 需要在 SearchModalProvider 下使用')
  }

  return {
    ...context,
  }
}
