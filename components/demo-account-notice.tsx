'use client'

import { useState, useEffect } from 'react'
import { X, Eye, Mail } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/auth-provider'

export function DemoAccountNotice() {
  const { user } = useAuth()
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    // 检查是否是演示账号
    if (user?.role === 'demo_viewer' && user?.username === 'demo') {
      // 检查是否已经在这个会话中被关闭过
      const dismissed = sessionStorage.getItem('demo-notice-dismissed')
      if (!dismissed) {
        setIsVisible(true)
      }
    } else {
      setIsVisible(false)
    }
  }, [user])

  const handleDismiss = () => {
    setIsVisible(false)
    setIsDismissed(true)
    // 在会话中记住已关闭状态
    sessionStorage.setItem('demo-notice-dismissed', 'true')
  }

  if (!isVisible || isDismissed) {
    return null
  }

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-2xl px-4">
      <Alert className="bg-blue-50 border-blue-200 shadow-lg">
        <Eye className="h-4 w-4 text-blue-600" />
        <AlertDescription>
          <div className="flex items-center justify-between">
            <div className="flex-1 pr-4">
              <p className="font-medium text-blue-900 mb-1">
                🎯 您正在使用演示账号（只读模式）
              </p>
              <p className="text-sm text-blue-800">
                当前账号只能查看系统数据，无法进行任何增加、修改或删除操作。
                如需完整功能体验，请联系作者：
                <a 
                  href="mailto:wangsuoo@qq.com" 
                  className="inline-flex items-center gap-1 ml-1 text-blue-700 hover:text-blue-900 underline"
                >
                  <Mail className="h-3 w-3" />
                  wangsuoo@qq.com
                </a>
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  )
}