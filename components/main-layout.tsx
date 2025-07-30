'use client'

import { usePathname, useRouter } from 'next/navigation'
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { NavigationProvider, navigationConfig } from "@/components/navigation-provider"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { ProtectedRoute } from "@/components/auth-provider"

interface MainLayoutProps {
  children: React.ReactNode
}

// 从导航配置自动生成路由映射
function buildRouteMapFromNavigation() {
  const routeMap: Record<string, { title: string; parent?: string }> = {}
  
  // 添加仪表盘首页
  routeMap['/'] = { title: navigationConfig.sections.dashboard.title }
  
  // 遍历所有导航配置生成路由映射
  Object.entries(navigationConfig.sections).forEach(([sectionKey, section]) => {
    if (sectionKey === 'dashboard') return // 已经处理了
    
    if ('items' in section && section.items) {
      section.items.forEach(item => {
        routeMap[item.path] = {
          title: item.title,
          parent: section.title
        }
      })
    }
  })
  
  return routeMap
}

// 动态路由的特殊处理映射
const dynamicRouteHandlers: Array<{
  pattern: (path: string) => boolean
  handler: (path: string) => { title: string; parent?: string } | null
}> = [
  {
    pattern: (path) => path.startsWith('/enterprises/') && path !== '/enterprises/new' && !path.includes('/edit'),
    handler: () => ({ title: '企业详情', parent: '企业管理' })
  },
  {
    pattern: (path) => path.startsWith('/enterprises/') && path.includes('/edit'),
    handler: () => ({ title: '编辑企业', parent: '企业管理' })
  },
  {
    pattern: (path) => path.startsWith('/content/products/') && !path.startsWith('/content/products/pending') && !path.startsWith('/content/products/new') && !path.includes('/edit'),
    handler: () => ({ title: '产品详情', parent: '内容管理' })
  },
  {
    pattern: (path) => path.startsWith('/content/products/') && path.includes('/edit'),
    handler: () => ({ title: '编辑产品', parent: '内容管理' })
  },
  {
    pattern: (path) => path.startsWith('/content/products/') && path.includes('/control-methods'),
    handler: () => ({ title: '防治方法管理', parent: '内容管理' })
  },
  {
    pattern: (path) => path.startsWith('/content/news/') && path !== '/content/news/new' && !path.includes('/edit'),
    handler: () => ({ title: '新闻详情', parent: '内容管理' })
  },
  {
    pattern: (path) => path.startsWith('/content/news/') && path.includes('/edit'),
    handler: () => ({ title: '编辑新闻', parent: '内容管理' })
  },
  {
    pattern: (path) => path === '/content/news/new',
    handler: () => ({ title: '新增新闻', parent: '内容管理' })
  },
  {
    pattern: (path) => path.startsWith('/business/sample-requests/') && !path.includes('/edit'),
    handler: () => ({ title: '样品申请详情', parent: '业务运营' })
  },
  {
    pattern: (path) => path.startsWith('/business/inquiries/') && !path.includes('/edit'),
    handler: () => ({ title: '询盘详情', parent: '业务运营' })
  },
  {
    pattern: (path) => path.startsWith('/business/registrations/') && !path.includes('/edit'),
    handler: () => ({ title: '登记详情', parent: '业务运营' })
  },
  {
    pattern: (path) => path.startsWith('/finance/vip-configs/') && path !== '/finance/vip-configs/new' && !path.includes('/edit'),
    handler: () => ({ title: '配置详情', parent: '财务管理' })
  },
  {
    pattern: (path) => path.startsWith('/finance/vip-configs/') && path.includes('/edit'),
    handler: () => ({ title: '编辑配置', parent: '财务管理' })
  },
  {
    pattern: (path) => path === '/finance/vip-configs/new',
    handler: () => ({ title: '新增配置', parent: '财务管理' })
  },
  {
    pattern: (path) => path.startsWith('/system/dictionary/') && path !== '/system/dictionary/new',
    handler: () => ({ title: '字典项管理', parent: '系统管理' })
  }
]

function generateBreadcrumbs(pathname: string) {
  const routeMap = buildRouteMapFromNavigation()
  let route = routeMap[pathname]
  
  // 处理动态路由
  if (!route) {
    for (const handler of dynamicRouteHandlers) {
      if (handler.pattern(pathname)) {
        route = handler.handler(pathname)
        break
      }
    }
  }
  
  if (!route) {
    return [{ title: '未知页面', href: pathname }]
  }

  const breadcrumbs = []
  
  // 添加仪表盘首页（除非当前就是首页）
  if (pathname !== '/') {
    breadcrumbs.push({ title: navigationConfig.sections.dashboard.title, href: '/' })
  }
  
  // 添加父级菜单
  if (route.parent) {
    breadcrumbs.push({ title: route.parent })
  }
  
  // 添加当前页面
  breadcrumbs.push({ title: route.title, href: pathname })
  
  return breadcrumbs
}

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const isLoginPage = pathname === '/login'

  if (isLoginPage) {
    // 登录页面使用简单布局
    return <>{children}</>
  }

  const breadcrumbs = generateBreadcrumbs(pathname)

  // 主应用使用侧边栏布局
  return (
    <ProtectedRoute>
      <NavigationProvider>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
              <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb>
                  <BreadcrumbList>
                    {breadcrumbs.map((breadcrumb, index) => (
                      <div key={breadcrumb.href || breadcrumb.title} className="flex items-center">
                        {index > 0 && <BreadcrumbSeparator className="hidden md:block" />}
                        <BreadcrumbItem className="hidden md:block">
                          {breadcrumb.href && index < breadcrumbs.length - 1 ? (
                            <BreadcrumbLink 
                              href={breadcrumb.href}
                              onClick={(e) => {
                                e.preventDefault()
                                router.push(breadcrumb.href!)
                              }}
                            >
                              {breadcrumb.title}
                            </BreadcrumbLink>
                          ) : (
                            <BreadcrumbPage>{breadcrumb.title}</BreadcrumbPage>
                          )}
                        </BreadcrumbItem>
                      </div>
                    ))}
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </header>
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
          </SidebarInset>
        </SidebarProvider>
      </NavigationProvider>
    </ProtectedRoute>
  )
}