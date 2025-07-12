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
  const isAuthenticated = apiClient.isAuthenticated() && !!user

  // 初始化时检查认证状态
  useEffect(() => {
    const checkAuth = () => {
      const hasToken = apiClient.isAuthenticated()
      
      if (hasToken) {
        // 如果有token但没有用户信息，可以尝试获取用户信息
        // 这里我们暂时设置一个默认用户（在实际应用中应该从API获取）
        if (!user) {
          setUser({
            id: 1,
            username: 'admin',
            role: 'operations_manager'
          })
        }
      } else {
        setUser(null)
      }
      
      setIsLoading(false)
    }

    checkAuth()
  }, [user])

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
  }, [isAuthenticated, isLoading, pathname, router])

  const login = (token: string, admin: Admin) => {
    apiClient.setAuth(token)
    setUser(admin)
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