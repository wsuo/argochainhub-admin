"use client"
import { Badge } from "@/components/ui/badge"
import { Shield, ChevronRight } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { useNavigation, navigationConfig } from "@/components/navigation-provider"
import { usePendingCompanies, usePendingProducts } from "@/hooks/use-api"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

export function AppSidebar() {
  const { user } = useAuth()
  const { state } = useSidebar()
  const pathname = usePathname()
  const router = useRouter()
  const { isPathActive, isSectionExpanded, toggleSection } = useNavigation()
  
  // 获取待审核企业数量
  const { data: pendingCompaniesData } = usePendingCompanies({ page: 1, limit: 1 })
  const pendingCompaniesCount = pendingCompaniesData?.meta?.totalItems || 0
  
  // 获取待审核产品数量
  const { data: pendingProductsData } = usePendingProducts({ page: 1, limit: 1 })
  const pendingProductsCount = pendingProductsData?.meta?.totalItems || 0
  
  const currentUserRole = user?.role || "operations_manager"

  // 根据用户角色过滤可访问的导航项
  const allowedSections = navigationConfig.rolePermissions[currentUserRole] || []
  const filteredSections = Object.entries(navigationConfig.sections)
    .filter(([key]) => allowedSections.includes(key))

  const handleNavigation = (path: string, sectionKey?: string) => {
    router.push(path)
    if (sectionKey) {
      // 确保相关section处于展开状态
      if (!isSectionExpanded(sectionKey)) {
        toggleSection(sectionKey)
      }
    }
  }

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <div className="flex items-center gap-2">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Shield className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="truncate font-semibold">ArgoChainHub</span>
                  <span className="truncate text-xs">管理后台</span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>平台管理</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredSections.map(([sectionKey, section]) => (
                <SidebarMenuItem key={sectionKey}>
                  {section.items ? (
                    <Collapsible 
                      open={isSectionExpanded(sectionKey)} 
                      onOpenChange={() => toggleSection(sectionKey)}
                      className="group/collapsible"
                    >
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton 
                          tooltip={section.title}
                          onClick={() => {
                            // 在折叠状态下点击图标跳转到第一个子项
                            if (state === 'collapsed' && section.items && section.items.length > 0) {
                              handleNavigation(section.items[0].path, sectionKey)
                            }
                          }}
                        >
                          {section.icon && <section.icon />}
                          <span className="truncate">{section.title}</span>
                          <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {section.items.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.key}>
                              <SidebarMenuSubButton asChild isActive={isPathActive(subItem.path)}>
                                <button 
                                  onClick={() => handleNavigation(subItem.path, sectionKey)}
                                  className="w-full flex items-center gap-2 text-left min-w-0"
                                >
                                  <span className="truncate flex-1">{subItem.title}</span>
                                  {/* 动态显示待审核数量 */}
                                  {subItem.key === 'pending' && pendingCompaniesCount > 0 && (
                                    <Badge variant="destructive" className="text-xs shrink-0">
                                      {pendingCompaniesCount}
                                    </Badge>
                                  )}
                                  {subItem.key === 'products-pending' && pendingProductsCount > 0 && (
                                    <Badge variant="destructive" className="text-xs shrink-0">
                                      {pendingProductsCount}
                                    </Badge>
                                  )}
                                  {/* 其他固定badge */}
                                  {subItem.badge && subItem.key !== 'pending' && subItem.key !== 'products-pending' && (
                                    <Badge variant="secondary" className="text-xs shrink-0">
                                      {subItem.badge}
                                    </Badge>
                                  )}
                                </button>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </Collapsible>
                  ) : (
                    <SidebarMenuButton 
                      tooltip={section.title} 
                      asChild 
                      isActive={isPathActive(section.path!)}
                    >
                      <button 
                        onClick={() => handleNavigation(section.path!, sectionKey)}
                        className="w-full flex items-center gap-2 text-left min-w-0"
                      >
                        {section.icon && <section.icon />}
                        <span className="truncate">{section.title}</span>
                      </button>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <div className="flex items-center gap-2">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                  <Shield className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="truncate font-semibold">{user?.username || 'Admin'}</span>
                  <span className="truncate text-xs">{user?.role === 'super_admin' ? '超级管理员' : user?.role === 'operations_manager' ? '运营管理员' : '客服'}</span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}