"use client"
import { Building2, FileText, DollarSign, Settings, Shield, Activity, ChevronRight, Home } from "lucide-react"

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

// Menu items organized by user role
const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
    roles: ["super_admin", "operations_manager", "customer_support"],
  },
  {
    title: "Enterprise Management",
    icon: Building2,
    roles: ["super_admin", "operations_manager"],
    items: [
      {
        title: "All Enterprises",
        url: "/enterprises",
      },
      {
        title: "Buyers",
        url: "/enterprises/buyers",
      },
      {
        title: "Suppliers",
        url: "/enterprises/suppliers",
      },
      {
        title: "Pending Reviews",
        url: "/enterprises/pending",
        badge: "23",
      },
    ],
  },
  {
    title: "Content Management",
    icon: FileText,
    roles: ["super_admin", "operations_manager"],
    items: [
      {
        title: "Product Review",
        url: "/content/products",
        badge: "8",
      },
      {
        title: "Supplier Review",
        url: "/content/suppliers",
        badge: "15",
      },
      {
        title: "AI Knowledge Base",
        url: "/content/knowledge",
      },
    ],
  },
  {
    title: "Business Operations",
    icon: Activity,
    roles: ["super_admin", "operations_manager", "customer_support"],
    items: [
      {
        title: "Inquiry Management",
        url: "/operations/inquiries",
      },
      {
        title: "Sample Management",
        url: "/operations/samples",
      },
      {
        title: "Registration Management",
        url: "/operations/registrations",
      },
    ],
  },
  {
    title: "Financial Management",
    icon: DollarSign,
    roles: ["super_admin", "operations_manager"],
    items: [
      {
        title: "Membership Plans",
        url: "/finance/plans",
      },
      {
        title: "Order Management",
        url: "/finance/orders",
      },
      {
        title: "Revenue Reports",
        url: "/finance/reports",
      },
    ],
  },
  {
    title: "System Management",
    icon: Settings,
    roles: ["super_admin"],
    items: [
      {
        title: "Admin Accounts",
        url: "/system/accounts",
      },
      {
        title: "Roles & Permissions",
        url: "/system/roles",
      },
      {
        title: "Data Dictionary",
        url: "/system/dictionary",
      },
      {
        title: "Operation Logs",
        url: "/system/logs",
      },
    ],
  },
]

export function AppSidebar() {
  const { state } = useSidebar()
  const currentUserRole = "operations_manager" // This would come from auth context

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter((item) => item.roles.includes(currentUserRole))

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <div className="flex items-center gap-2">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Shield className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Argochainhub</span>
                  <span className="truncate text-xs">Admin Portal</span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.items ? (
                    <Collapsible defaultOpen className="group/collapsible">
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton tooltip={item.title}>
                          {item.icon && <item.icon />}
                          <span>{item.title}</span>
                          <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton asChild>
                                <a href={subItem.url} className="flex items-center justify-between">
                                  <span>{subItem.title}</span>
                                  {subItem.badge && (
                                    <Badge variant="secondary" className="ml-auto text-xs">
                                      {subItem.badge}
                                    </Badge>
                                  )}
                                </a>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </Collapsible>
                  ) : (
                    <SidebarMenuButton tooltip={item.title} asChild>
                      <a href={item.url}>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                      </a>
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
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Operations Manager</span>
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
