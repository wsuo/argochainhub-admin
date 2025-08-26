import { toast } from 'sonner'
import { Shield, Mail } from 'lucide-react'

/**
 * 显示演示账号权限限制提示
 */
export function showDemoPermissionToast() {
  toast.error(
    '演示账号权限限制',
    {
      description: (
        <div className="space-y-2 mt-2">
          <div className="flex items-center gap-2 text-sm">
            <Shield className="h-4 w-4 text-blue-600" />
            <span>当前使用的是演示账号，仅支持查看功能，无法进行增加、修改或删除操作。</span>
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            如需完整功能体验，请联系：
            <a 
              href="mailto:wangsuoo@qq.com" 
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 underline"
            >
              <Mail className="h-3 w-3" />
              wangsuoo@qq.com
            </a>
          </div>
        </div>
      ),
      duration: 8000, // 显示8秒
    }
  )
}

/**
 * 显示通用的权限不足提示
 */
export function showPermissionDeniedToast(message?: string) {
  toast.error(
    '权限不足',
    {
      description: message || '您没有执行此操作的权限',
      duration: 5000,
    }
  )
}

/**
 * 根据用户角色显示相应的权限提示
 */
export function showRoleBasedPermissionToast(userRole?: string, message?: string) {
  if (userRole === 'demo_viewer') {
    showDemoPermissionToast()
  } else {
    showPermissionDeniedToast(message)
  }
}