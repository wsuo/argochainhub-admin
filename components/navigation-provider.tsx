'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { Building2, FileText, DollarSign, Settings, Activity, Home } from 'lucide-react'

interface NavigationState {
  activeSection: string
  expandedSections: string[]
  activePage: string
}

interface NavigationContextType {
  navigationState: NavigationState
  setActiveSection: (section: string) => void
  toggleSection: (section: string) => void
  setActivePage: (page: string) => void
  isPathActive: (path: string) => boolean
  isSectionExpanded: (section: string) => boolean
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined)

// 路由到导航映射
const routeToNavigation: Record<string, { section: string; page?: string }> = {
  '/': { section: 'dashboard' },
  '/enterprises': { section: 'enterprise', page: 'all' },
  '/enterprises/pending': { section: 'enterprise', page: 'pending' },
  '/enterprises/buyers': { section: 'enterprise', page: 'buyers' },
  '/enterprises/suppliers': { section: 'enterprise', page: 'suppliers' },
  '/enterprises/new': { section: 'enterprise', page: 'new' },
  '/content/products': { section: 'content', page: 'products' },
  '/content/suppliers': { section: 'content', page: 'suppliers' },
  '/business/inquiries': { section: 'business', page: 'inquiries' },
  '/business/samples': { section: 'business', page: 'samples' },
  '/business/registrations': { section: 'business', page: 'registrations' },
  '/finance/plans': { section: 'finance', page: 'plans' },
  '/finance/orders': { section: 'finance', page: 'orders' },
  '/finance/revenue': { section: 'finance', page: 'revenue' },
  '/system/accounts': { section: 'system', page: 'accounts' },
  '/system/roles': { section: 'system', page: 'roles' },
  '/system/logs': { section: 'system', page: 'logs' },
  '/system/dictionary': { section: 'system', page: 'dictionary' },
}

interface NavigationProviderProps {
  children: ReactNode
}

export function NavigationProvider({ children }: NavigationProviderProps) {
  const pathname = usePathname()
  
  const [navigationState, setNavigationState] = useState<NavigationState>({
    activeSection: 'dashboard',
    expandedSections: [],
    activePage: ''
  })

  // 根据当前路径自动更新导航状态
  useEffect(() => {
    // 处理动态路由
    let currentPath = pathname
    
    // 企业详情页面
    if (pathname.startsWith('/enterprises/') && pathname !== '/enterprises/new') {
      currentPath = '/enterprises'
    }
    
    // 字典项管理页面
    if (pathname.startsWith('/system/dictionary/') && pathname !== '/system/dictionary/new') {
      currentPath = '/system/dictionary'
    }

    const navInfo = routeToNavigation[currentPath]
    
    if (navInfo) {
      setNavigationState(prev => ({
        ...prev,
        activeSection: navInfo.section,
        activePage: navInfo.page || '',
        expandedSections: prev.expandedSections.includes(navInfo.section) 
          ? prev.expandedSections 
          : [...prev.expandedSections, navInfo.section]
      }))
    }
  }, [pathname])

  const setActiveSection = (section: string) => {
    setNavigationState(prev => ({
      ...prev,
      activeSection: section,
      expandedSections: prev.expandedSections.includes(section) 
        ? prev.expandedSections 
        : [...prev.expandedSections, section]
    }))
  }

  const toggleSection = (section: string) => {
    setNavigationState(prev => ({
      ...prev,
      expandedSections: prev.expandedSections.includes(section)
        ? prev.expandedSections.filter(s => s !== section)
        : [...prev.expandedSections, section]
    }))
  }

  const setActivePage = (page: string) => {
    setNavigationState(prev => ({
      ...prev,
      activePage: page
    }))
  }

  const isPathActive = (path: string): boolean => {
    if (pathname === path) return true
    
    // 处理动态路由的激活状态
    if (path === '/enterprises' && pathname.startsWith('/enterprises/')) return true
    if (path === '/system/dictionary' && pathname.startsWith('/system/dictionary/')) return true
    
    return false
  }

  const isSectionExpanded = (section: string): boolean => {
    return navigationState.expandedSections.includes(section)
  }

  const value: NavigationContextType = {
    navigationState,
    setActiveSection,
    toggleSection,
    setActivePage,
    isPathActive,
    isSectionExpanded
  }

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  )
}

export function useNavigation() {
  const context = useContext(NavigationContext)
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider')
  }
  return context
}

// 导航配置数据
export const navigationConfig = {
  sections: {
    dashboard: { title: '仪表盘', icon: Home, path: '/' },
    enterprise: { 
      title: '企业管理', 
      icon: Building2,
      items: [
        { title: '全部企业', path: '/enterprises', key: 'all' },
        { title: '待审核企业', path: '/enterprises/pending', key: 'pending', badge: '审核待处理' },
        { title: '采购企业', path: '/enterprises/buyers', key: 'buyers' },
        { title: '供应企业', path: '/enterprises/suppliers', key: 'suppliers' }
      ]
    },
    content: {
      title: '内容管理',
      icon: FileText,
      items: [
        { title: '产品审核', path: '/content/products', key: 'products', badge: '待审核' },
        { title: '供应商审核', path: '/content/suppliers', key: 'suppliers' }
      ]
    },
    business: {
      title: '业务运营',
      icon: Activity,
      items: [
        { title: '询盘管理', path: '/business/inquiries', key: 'inquiries' },
        { title: '样品管理', path: '/business/samples', key: 'samples' },
        { title: '注册管理', path: '/business/registrations', key: 'registrations' }
      ]
    },
    finance: {
      title: '财务管理',
      icon: DollarSign,
      items: [
        { title: '会员计划', path: '/finance/plans', key: 'plans' },
        { title: '订单管理', path: '/finance/orders', key: 'orders' },
        { title: '收入统计', path: '/finance/revenue', key: 'revenue' }
      ]
    },
    system: {
      title: '系统管理',
      icon: Settings,
      items: [
        { title: '管理员账户', path: '/system/accounts', key: 'accounts' },
        { title: '角色权限', path: '/system/roles', key: 'roles' },
        { title: '操作日志', path: '/system/logs', key: 'logs' },
        { title: '数据字典', path: '/system/dictionary', key: 'dictionary' }
      ]
    }
  },
  
  // 角色权限映射
  rolePermissions: {
    super_admin: ['dashboard', 'enterprise', 'content', 'business', 'finance', 'system'],
    operations_manager: ['dashboard', 'enterprise', 'content', 'business'],
    customer_support: ['dashboard', 'enterprise', 'business']
  }
}