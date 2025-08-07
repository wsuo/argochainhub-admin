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
  '/content/products/pending': { section: 'content', page: 'products-pending' },
  '/content/products/new': { section: 'content', page: 'products-new' },
  '/content/suppliers': { section: 'content', page: 'suppliers' },
  '/content/pesticides': { section: 'content', page: 'pesticides' },
  '/content/pesticides/new': { section: 'content', page: 'pesticides' },
  '/content/news': { section: 'content', page: 'news' },
  '/content/news/new': { section: 'content', page: 'news' },
  '/business/inquiries': { section: 'business', page: 'inquiries' },
  '/business/sample-requests': { section: 'business', page: 'samples' },
  '/business/registrations': { section: 'business', page: 'registrations' },
  '/finance/vip-configs': { section: 'finance', page: 'vip-configs' },
  '/finance/vip-configs/new': { section: 'finance', page: 'vip-configs' },
  '/finance/orders': { section: 'finance', page: 'orders' },
  '/finance/revenue': { section: 'finance', page: 'revenue' },
  '/system/accounts': { section: 'system', page: 'accounts' },
  '/system/roles': { section: 'system', page: 'roles' },
  '/system/logs': { section: 'system', page: 'logs' },
  '/system/dictionary': { section: 'system', page: 'dictionary' },
  '/system/email-configs': { section: 'system', page: 'email-configs' },
  '/system/email-templates': { section: 'system', page: 'email-templates' },
  '/system/email-histories': { section: 'system', page: 'email-histories' },
  '/system/notifications': { section: 'system', page: 'notifications' },
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
    
    // 产品相关页面
    if (pathname.startsWith('/content/products/') && !pathname.startsWith('/content/products/pending') && !pathname.startsWith('/content/products/new')) {
      // 防治方法管理页面也应该激活产品管理
      if (pathname.includes('/control-methods')) {
        currentPath = '/content/products'
      } else {
        currentPath = '/content/products'
      }
    }
    
    // 新闻资讯相关页面
    if (pathname.startsWith('/content/news/') && pathname !== '/content/news/new') {
      currentPath = '/content/news'
    }
    
    // 样品申请详情页面
    if (pathname.startsWith('/business/sample-requests/') && pathname !== '/business/sample-requests/new') {
      currentPath = '/business/sample-requests'
    }
    
    // VIP配置详情页面
    if (pathname.startsWith('/finance/vip-configs/') && pathname !== '/finance/vip-configs/new') {
      currentPath = '/finance/vip-configs'
    }
    
    // 邮件配置相关页面
    if (pathname.startsWith('/system/email-configs/') && pathname !== '/system/email-configs/new') {
      currentPath = '/system/email-configs'
    }
    
    // 邮件模板相关页面
    if (pathname.startsWith('/system/email-templates/') && pathname !== '/system/email-templates/new') {
      currentPath = '/system/email-templates'
    }
    
    // 邮件历史详情页面
    if (pathname.startsWith('/system/email-histories/')) {
      currentPath = '/system/email-histories'
    }
    
    // 通知管理相关页面
    if (pathname.startsWith('/system/notifications')) {
      currentPath = '/system/notifications'
    }
    
    // 字典项管理页面
    if (pathname.startsWith('/system/dictionary/') && pathname !== '/system/dictionary/new') {
      currentPath = '/system/dictionary'
    }
    
    // 农药价格管理相关页面
    if (pathname.startsWith('/content/pesticides/')) {
      if (pathname === '/content/pesticides/new') {
        currentPath = '/content/pesticides/new'
      } else if (pathname.includes('/prices')) {
        currentPath = '/content/pesticides'
      } else {
        currentPath = '/content/pesticides'
      }
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
    if (path === '/content/products' && pathname.startsWith('/content/products/')) return true
    if (path === '/content/pesticides' && pathname.startsWith('/content/pesticides/')) return true
    if (path === '/content/news' && pathname.startsWith('/content/news/')) return true
    if (path === '/business/sample-requests' && pathname.startsWith('/business/sample-requests/')) return true
    if (path === '/finance/vip-configs' && pathname.startsWith('/finance/vip-configs/')) return true
    if (path === '/system/dictionary' && pathname.startsWith('/system/dictionary/')) return true
    if (path === '/system/email-configs' && pathname.startsWith('/system/email-configs/')) return true
    if (path === '/system/email-templates' && pathname.startsWith('/system/email-templates/')) return true
    if (path === '/system/email-histories' && pathname.startsWith('/system/email-histories/')) return true
    if (path === '/system/notifications' && pathname.startsWith('/system/notifications')) return true
    
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
        { title: '待审核企业', path: '/enterprises/pending', key: 'pending' },
        { title: '采购企业', path: '/enterprises/buyers', key: 'buyers' },
        { title: '供应企业', path: '/enterprises/suppliers', key: 'suppliers' }
      ]
    },
    content: {
      title: '内容管理',
      icon: FileText,
      items: [
        { title: '产品管理', path: '/content/products', key: 'products' },
        { title: '待审核产品', path: '/content/products/pending', key: 'products-pending' },
        { title: '农药价格', path: '/content/pesticides', key: 'pesticides' },
        { title: '新闻资讯', path: '/content/news', key: 'news' }
      ]
    },
    business: {
      title: '业务运营',
      icon: Activity,
      items: [
        { title: '询盘管理', path: '/business/inquiries', key: 'inquiries' },
        { title: '样品管理', path: '/business/sample-requests', key: 'samples' },
        { title: '登记管理', path: '/business/registrations', key: 'registrations' }
      ]
    },
    finance: {
      title: '财务管理',
      icon: DollarSign,
      items: [
        { title: '会员配置', path: '/finance/vip-configs', key: 'vip-configs' },
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
        { title: '数据字典', path: '/system/dictionary', key: 'dictionary' },
        { title: '邮件配置', path: '/system/email-configs', key: 'email-configs' },
        { title: '邮件模板', path: '/system/email-templates', key: 'email-templates' },
        { title: '邮件历史', path: '/system/email-histories', key: 'email-histories' },
        { title: '通知管理', path: '/system/notifications', key: 'notifications' }
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