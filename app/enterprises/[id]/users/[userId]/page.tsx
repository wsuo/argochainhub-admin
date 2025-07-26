'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  User, 
  Building2,
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
  XCircle,
  Edit,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Shield,
  Briefcase,
  Users
} from 'lucide-react'
import { 
  useCompany, 
  useCompanyUser, 
  useDeleteCompanyUser, 
  useToggleCompanyUserStatus 
} from '@/hooks/use-api'
import { ErrorDisplay } from '@/components/ui/error-display'
import { LoadingState } from '@/components/ui/loading-state'
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

export default function CompanyUserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const companyId = parseInt(params.id as string)
  const userId = parseInt(params.userId as string)
  
  const { data: company, isLoading: companyLoading, error: companyError } = useCompany(companyId)
  const { data: user, isLoading: userLoading, error: userError } = useCompanyUser(companyId, userId)
  const deleteUserMutation = useDeleteCompanyUser()
  const toggleStatusMutation = useToggleCompanyUserStatus()

  const handleToggleStatus = async () => {
    if (companyId && userId) {
      await toggleStatusMutation.mutateAsync({ companyId, userId })
    }
  }

  const handleDelete = async () => {
    if (companyId && userId) {
      await deleteUserMutation.mutateAsync({ companyId, userId })
      router.push(`/enterprises/${companyId}/users`)
    }
  }

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'owner':
        return <Badge variant="destructive" className="gap-1"><Shield className="h-3 w-3" />企业主</Badge>
      case 'admin':
        return <Badge variant="default" className="gap-1"><Shield className="h-3 w-3" />管理员</Badge>
      case 'member':
        return <Badge variant="secondary" className="gap-1"><User className="h-3 w-3" />普通员工</Badge>
      default:
        return <Badge variant="outline">{role}</Badge>
    }
  }

  const getStatusBadge = (isActive?: boolean) => {
    if (!isActive) {
      return <Badge variant="destructive">已禁用</Badge>
    } else {
      return <Badge variant="secondary">正常</Badge>
    }
  }

  if (companyError || userError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/enterprises/${companyId}/users`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回员工列表
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">员工详情</h1>
            <p className="text-muted-foreground">查看员工详细信息</p>
          </div>
        </div>
        <ErrorDisplay 
          error={companyError || userError}
          title="加载数据失败"
          showRetry={true}
          onRetry={() => window.location.reload()}
        />
      </div>
    )
  }

  if (companyLoading || userLoading || !company || !user) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/enterprises/${companyId}/users`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回员工列表
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">员工详情</h1>
            <p className="text-muted-foreground">查看员工详细信息</p>
          </div>
        </div>
        <LoadingState
          type="card"
          message="加载员工信息..."
          description="正在获取员工详细信息"
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
            <Link href={`/enterprises/${companyId}/users`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回员工列表
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">员工详情</h1>
            <p className="text-muted-foreground">
              {getMultiLangText(company.name, 'zh-CN')} - {user.name}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/enterprises/${companyId}/users/${userId}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            编辑
          </Button>
          <Button
            variant="outline"
            onClick={handleToggleStatus}
            disabled={toggleStatusMutation.isPending}
          >
            {user.isActive ? (
              <ToggleRight className="h-4 w-4 mr-2" />
            ) : (
              <ToggleLeft className="h-4 w-4 mr-2" />
            )}
            {user.isActive ? '禁用账户' : '启用账户'}
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                删除员工
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>确认删除员工</AlertDialogTitle>
                <AlertDialogDescription>
                  此操作将永久删除员工 "{user.name}" 的账户，包括相关的所有数据。
                  该操作无法撤销，请确认是否继续。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>取消</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  确认删除
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：基本信息 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 基本信息卡片 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                基本信息
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">姓名</label>
                    <div className="mt-1 text-lg font-semibold">{user.name}</div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">邮箱</label>
                    <div className="mt-1 flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{user.email}</span>
                    </div>
                  </div>

                  {user.phone && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">手机号</label>
                      <div className="mt-1 flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{user.phone}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">角色权限</label>
                    <div className="mt-1">
                      {getRoleBadge(user.role)}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">账户状态</label>
                    <div className="mt-1">
                      {getStatusBadge(user.isActive)}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">入职时间</label>
                    <div className="mt-1 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{new Date(user.joinedAt).toLocaleDateString('zh-CN')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 职位信息卡片 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                职位信息
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">所属部门</label>
                  <div className="mt-1">
                    {user.department || <span className="text-muted-foreground">未设置</span>}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">职位名称</label>
                  <div className="mt-1">
                    {user.position || <span className="text-muted-foreground">未设置</span>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 登录信息卡片 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                登录信息
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">注册时间</label>
                  <div className="mt-1">
                    {new Date(user.createdAt).toLocaleString('zh-CN')}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">上次登录</label>
                  <div className="mt-1">
                    {user.lastLoginAt ? 
                      new Date(user.lastLoginAt).toLocaleString('zh-CN') : 
                      <span className="text-muted-foreground">从未登录</span>
                    }
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 右侧：企业信息和操作 */}
        <div className="space-y-6">
          {/* 企业信息卡片 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                所属企业
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>

          {/* 快捷操作卡片 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                快捷操作
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => router.push(`/enterprises/${companyId}/users`)}
              >
                <Users className="h-4 w-4 mr-2" />
                查看所有员工
              </Button>
              
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => router.push(`/enterprises/${companyId}`)}
              >
                <Building2 className="h-4 w-4 mr-2" />
                查看企业详情
              </Button>
              
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => router.push(`/enterprises/${companyId}/users/new`)}
              >
                <User className="h-4 w-4 mr-2" />
                新增员工
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}