'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import apiClient from '@/lib/api-client'
import type { Admin } from '@/lib/types'

interface AuthContextType {
  user: Admin | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (token: string, admin: Admin) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<Admin | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // 检查用户是否已认证
  const isAuthenticated = !!user && apiClient.isAuthenticated()

  // 初始化时检查认证状态
  useEffect(() => {
    const checkAuth = () => {
      const hasToken = apiClient.isAuthenticated()
      
      if (hasToken && !user) {
        // 如果有token但没有用户信息，设置一个默认用户
        // 在实际应用中，这里应该调用API获取用户信息
        const defaultUser = {
          id: 1,
          username: 'admin',
          role: 'operations_manager' as const
        }
        setUser(defaultUser)
      } else if (!hasToken && user) {
        setUser(null)
      }
      
      setIsLoading(false)
    }

    // 只在初始化时运行一次
    if (isLoading) {
      checkAuth()
    }
  }, [isLoading]) // 只依赖 isLoading

  // 路由保护
  useEffect(() => {
    if (!isLoading) {
      const isLoginPage = pathname === '/login'
      
      if (!isAuthenticated && !isLoginPage) {
        router.push('/login')
      } else if (isAuthenticated && isLoginPage) {
        router.push('/')
      }
    }
  }, [isAuthenticated, isLoading, pathname, router, user])

  const login = (token: string, admin: Admin) => {
    apiClient.setAuth(token)
    setUser(admin)
    setIsLoading(false) // 确保加载状态正确
    router.push('/')
  }

  const logout = () => {
    apiClient.clearAuth()
    setUser(null)
    router.push('/login')
  }

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// 路由保护组件
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  const pathname = usePathname()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated && pathname !== '/login') {
    return null // 重定向会在AuthProvider中处理
  }

  return <>{children}</>
}