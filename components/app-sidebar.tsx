"use client"
import { Building2, FileText, DollarSign, Settings, Shield, Activity, ChevronRight, Home } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

// 按用户角色组织的菜单项
const menuItems = [
  {
    title: "仪表盘",
    url: "/",
    icon: Home,
    roles: ["super_admin", "operations_manager", "customer_support"],
  },
  {
    title: "企业管理",
    icon: Building2,
    roles: ["super_admin", "operations_manager"],
    items: [
      {
        title: "全部企业",
        url: "/enterprises",
      },
      {
        title: "采购商",
        url: "/enterprises/buyers",
      },
      {
        title: "供应商",
        url: "/enterprises/suppliers",
      },
      {
        title: "待审核",
        url: "/enterprises/pending",
        badge: "23",
      },
    ],
  },
  {
    title: "内容管理",
    icon: FileText,
    roles: ["super_admin", "operations_manager"],
    items: [
      {
        title: "产品审核",
        url: "/content/products",
        badge: "8",
      },
      {
        title: "供应商审核",
        url: "/content/suppliers",
        badge: "15",
      },
      {
        title: "AI知识库",
        url: "/content/knowledge",
      },
    ],
  },
  {
    title: "业务运营",
    icon: Activity,
    roles: ["super_admin", "operations_manager", "customer_support"],
    items: [
      {
        title: "询价管理",
        url: "/operations/inquiries",
      },
      {
        title: "样品管理",
        url: "/operations/samples",
      },
      {
        title: "登记管理",
        url: "/operations/registrations",
      },
    ],
  },
  {
    title: "财务管理",
    icon: DollarSign,
    roles: ["super_admin", "operations_manager"],
    items: [
      {
        title: "会员套餐",
        url: "/finance/plans",
      },
      {
        title: "订单管理",
        url: "/finance/orders",
      },
      {
        title: "收入报表",
        url: "/finance/reports",
      },
    ],
  },
  {
    title: "系统管理",
    icon: Settings,
    roles: ["super_admin"],
    items: [
      {
        title: "管理员账户",
        url: "/system/accounts",
      },
      {
        title: "角色权限",
        url: "/system/roles",
      },
      {
        title: "数据字典",
        url: "/system/dictionary",
      },
      {
        title: "操作日志",
        url: "/system/logs",
      },
    ],
  },
]

export function AppSidebar() {
  const { state } = useSidebar()
  const pathname = usePathname()
  const router = useRouter()
  const currentUserRole = "operations_manager" // 这将来自认证上下文

  // 根据用户角色过滤菜单项
  const filteredMenuItems = menuItems.filter((item) => item.roles.includes(currentUserRole))

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
              {filteredMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.items ? (
                    <Collapsible defaultOpen className="group/collapsible">
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton 
                          tooltip={item.title}
                          onClick={() => {
                            // 在折叠状态下点击图标跳转到第一个子项
                            if (state === 'collapsed' && item.items && item.items.length > 0) {
                              router.push(item.items[0].url)
                            }
                          }}
                        >
                          {item.icon && <item.icon />}
                          <span>{item.title}</span>
                          <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton asChild isActive={pathname === subItem.url}>
                                <Link href={subItem.url} className="flex items-center justify-between">
                                  <span>{subItem.title}</span>
                                  {subItem.badge && (
                                    <Badge variant="secondary" className="ml-auto text-xs">
                                      {subItem.badge}
                                    </Badge>
                                  )}
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </Collapsible>
                  ) : (
                    <SidebarMenuButton tooltip={item.title} asChild isActive={pathname === item.url}>
                      <Link href={item.url}>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                      </Link>
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
            <SidebarMenuButton size="lg" asChild>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Admin" />
                  <AvatarFallback className="rounded-lg">OM</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="truncate font-semibold">运营经理</span>
                  <span className="truncate text-xs">admin@argochainhub.com</span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
