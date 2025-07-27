'use client'

import { usePathname, useRouter } from 'next/navigation'
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { NavigationProvider } from "@/components/navigation-provider"
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

// 路由映射配置
const routeMap: Record<string, { title: string; parent?: string }> = {
  '/': { title: '概览' },
  '/enterprises': { title: '企业管理', parent: '企业管理' },
  '/enterprises/pending': { title: '待审核企业', parent: '企业管理' },
  '/enterprises/new': { title: '新增企业', parent: '企业管理' },
  '/content/products': { title: '产品审核', parent: '内容管理' },
  '/content/suppliers': { title: '供应商审核', parent: '内容管理' },
  '/content/ai-knowledge': { title: 'AI知识库', parent: '内容管理' },
  '/business/inquiries': { title: '询盘管理', parent: '业务运营' },
  '/business/sample-requests': { title: '样品管理', parent: '业务运营' },
  '/business/registrations': { title: '注册审核', parent: '业务运营' },
  '/finance/plans': { title: '会员计划', parent: '财务管理' },
  '/finance/orders': { title: '订单管理', parent: '财务管理' },
  '/finance/revenue': { title: '收入统计', parent: '财务管理' },
  '/system/admins': { title: '管理员账户', parent: '系统管理' },
  '/system/roles': { title: '角色权限', parent: '系统管理' },
  '/system/dictionary': { title: '数据字典', parent: '系统管理' },
  '/system/logs': { title: '操作日志', parent: '系统管理' },
}

function generateBreadcrumbs(pathname: string) {
  let route = routeMap[pathname]
  
  // 处理动态路由，如 /enterprises/123
  if (!route) {
    if (pathname.startsWith('/enterprises/') && pathname !== '/enterprises/new') {
      route = { title: '企业详情', parent: '企业管理' }
    } else if (pathname.startsWith('/business/sample-requests/')) {
      route = { title: '样品申请详情', parent: '业务运营' }
    } else if (pathname.startsWith('/business/inquiries/')) {
      route = { title: '询盘详情', parent: '业务运营' }
    } else if (pathname.startsWith('/system/dictionary/') && pathname !== '/system/dictionary/new') {
      route = { title: '字典项管理', parent: '系统管理' }
    }
  }
  
  if (!route) {
    return [{ title: '未知页面', href: pathname }]
  }

  const breadcrumbs = []
  
  // 添加仪表盘首页
  if (pathname !== '/') {
    breadcrumbs.push({ title: '仪表盘', href: '/' })
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