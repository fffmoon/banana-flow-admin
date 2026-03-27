import type { DirectiveBinding } from 'vue'

export interface CopyDirectiveBinding extends DirectiveBinding {
  value: string | (() => string) | { text?: string, onSuccess?: () => void, onError?: (err: Error) => void }
}
