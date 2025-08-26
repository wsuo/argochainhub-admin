import { toast } from 'sonner'
import type { ApiError } from './types'

/**
 * 统一的mutation错误处理函数
 * 如果错误已被API拦截器处理（如403权限错误），则不显示重复的toast
 */
export function handleMutationError(error: any, fallbackMessage: string) {
  // 检查是否是已处理的API错误
  if (error && typeof error === 'object' && error.handled) {
    // 错误已被处理（如通过API拦截器显示了权限提示），不显示额外的toast
    return
  }
  
  // 显示错误toast
  const message = error?.message || fallbackMessage
  toast.error(message)
}