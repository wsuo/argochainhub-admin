'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  Users, 
  Plus, 
  Building2,
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
  XCircle,
  User,
  Eye,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight
} from 'lucide-react'
import { 
  useCompany, 
  useCompanyUsers, 
  useDeleteCompanyUser, 
  useToggleCompanyUserStatus 
} from '@/hooks/use-api'
import { DataPagination } from '@/components/data-pagination'
import { ErrorDisplay } from '@/components/ui/error-display'
import { LoadingState } from '@/components/ui/loading-state'
import type { CompanyUser, CompanyUserQuery } from '@/lib/types'
import { getMultiLangText } from '@/lib/multi-lang-utils'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export default function CompanyUsersPage() {
  const params = useParams()
  const router = useRouter()
  const companyId = parseInt(params.id as string)
  
  const [query, setQuery] = useState<CompanyUserQuery>({
    page: 1,
    limit: 20,
  })
  
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // API调用
  const { data: company, isLoading: companyLoading, error: companyError } = useCompany(companyId)
  const { data: usersData, isLoading: usersLoading, error: usersError } = useCompanyUsers(companyId, query)
  const deleteUserMutation = useDeleteCompanyUser()
  const toggleStatusMutation = useToggleCompanyUserStatus()

  const handlePageChange = (page: number) => {
    setQuery(prev => ({ ...prev, page }))
  }

  const handleDeleteClick = (userId: number) => {
    setDeleteUserId(userId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (deleteUserId && companyId) {
      await deleteUserMutation.mutateAsync({ companyId, userId: deleteUserId })
      setDeleteDialogOpen(false)
      setDeleteUserId(null)
    }
  }

  const handleToggleStatus = async (userId: number) => {
    if (companyId) {
      await toggleStatusMutation.mutateAsync({ companyId, userId })
    }
  }

  const getRoleBadge = (role: CompanyUser['role']) => {
    switch (role) {
      case 'owner':
        return <Badge variant="destructive">企业主</Badge>
      case 'admin':
        return <Badge variant="default">管理员</Badge>
      case 'member':
        return <Badge variant="secondary">普通员工</Badge>
      default:
        return <Badge variant="outline">{role}</Badge>
    }
  }

  const getStatusBadge = (isActive: boolean) => {
    if (!isActive) {
      return <Badge variant="destructive">已禁用</Badge>
    } else {
      return <Badge variant="secondary">正常</Badge>
    }
  }

  if (companyError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/enterprises">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回企业列表
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">企业用户管理</h1>
            <p className="text-muted-foreground">管理企业员工信息</p>
          </div>
        </div>
        <ErrorDisplay 
          error={companyError}
          title="加载企业信息失败"
          showRetry={true}
          onRetry={() => window.location.reload()}
        />
      </div>
    )
  }

  if (companyLoading || !company) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/enterprises">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回企业列表
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">企业用户管理</h1>
            <p className="text-muted-foreground">管理企业员工信息</p>
          </div>
        </div>
        <LoadingState
          type="card"
          message="加载企业信息..."
          description="正在获取企业基本信息"
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/enterprises">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回企业列表
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">企业用户管理</h1>
            <p className="text-muted-foreground">
              管理 {getMultiLangText(company.name, 'zh-CN')} 的员工信息
            </p>
          </div>
        </div>
        <Button onClick={() => router.push(`/enterprises/${companyId}/users/new`)}>
          <Plus className="h-4 w-4 mr-2" />
          新增员工
        </Button>
      </div>

      {/* 企业基本信息卡片 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            企业基本信息
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">企业名称</label>
              <div className="mt-1">
                <div className="font-semibold">{getMultiLangText(company.name, 'zh-CN')}</div>
                {company.name.en && (
                  <div className="text-sm text-muted-foreground">{company.name.en}</div>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">企业类型</label>
              <div className="mt-1">
                <Badge variant="secondary">
                  {company.type === 'supplier' ? '供应商' : 
                   company.type === 'buyer' ? '采购商' :
                   company.type === 'manufacturer' ? '制造商' : '分销商'}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">企业状态</label>
              <div className="mt-1">
                <Badge variant={company.status === 'active' ? 'secondary' : 'destructive'}>
                  {company.status === 'active' ? '已激活' :
                   company.status === 'pending_review' ? '待审核' : '已禁用'}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">员工总数</label>
              <div className="mt-1 font-semibold">
                {usersData?.meta?.totalItems || 0} 人
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 用户列表 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                员工列表
              </CardTitle>
              <CardDescription>
                {usersData && `共 ${usersData.meta.totalItems} 名员工，当前显示第 ${usersData.meta.currentPage} 页`}
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => router.push(`/enterprises/${companyId}/users/new`)}
            >
              <Plus className="h-4 w-4 mr-2" />
              新增员工
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {usersError ? (
            <ErrorDisplay 
              error={usersError}
              title="加载员工列表失败"
              showRetry={true}
              onRetry={() => window.location.reload()}
            />
          ) : usersLoading ? (
            <LoadingState
              type="table"
              message="加载员工列表..."
              description="正在获取员工信息"
            />
          ) : usersData?.data.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30" />
              <h3 className="text-xl font-semibold mb-2">暂无员工</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                该企业还没有添加任何员工，点击下方按钮开始添加第一个员工
              </p>
              <Button onClick={() => router.push(`/enterprises/${companyId}/users/new`)}>
                <Plus className="h-4 w-4 mr-2" />
                添加第一个员工
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {usersData?.data.map((user) => (
                  <div key={user.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="h-6 w-6 text-primary" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-lg">{user.name}</h4>
                            {getRoleBadge(user.role)}
                            {getStatusBadge(user.isActive)}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span>{user.email}</span>
                            </div>
                            
                            {user.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span>{user.phone}</span>
                              </div>
                            )}
                            
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>入职: {new Date(user.joinedAt).toLocaleDateString('zh-CN')}</span>
                            </div>
                            
                            {user.position && (
                              <div className="text-muted-foreground">
                                职位: {user.position}
                              </div>
                            )}
                            
                            {user.department && (
                              <div className="text-muted-foreground">
                                部门: {user.department}
                              </div>
                            )}
                            
                            {user.lastLoginAt && (
                              <div className="text-muted-foreground">
                                上次登录: {new Date(user.lastLoginAt).toLocaleDateString('zh-CN')}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/enterprises/${companyId}/users/${user.id}`)}
                          title="查看详情"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/enterprises/${companyId}/users/${user.id}/edit`)}
                          title="编辑"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStatus(user.id)}
                          disabled={toggleStatusMutation.isPending}
                          title={user.isActive ? '点击禁用' : '点击启用'}
                        >
                          {user.isActive ? (
                            <ToggleRight className="h-4 w-4" />
                          ) : (
                            <ToggleLeft className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClick(user.id)}
                          title="删除"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 分页 */}
              {usersData && usersData.meta && (
                <div className="mt-6">
                  <DataPagination
                    currentPage={usersData.meta.currentPage}
                    totalPages={usersData.meta.totalPages}
                    totalItems={usersData.meta.totalItems}
                    itemsPerPage={usersData.meta.itemsPerPage}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* 删除确认对话框 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除员工</AlertDialogTitle>
            <AlertDialogDescription>
              此操作将永久删除该员工账户，包括相关的所有数据。
              该操作无法撤销，请确认是否继续。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}