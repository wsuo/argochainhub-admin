'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, Loader2, Save, TestTube, Eye, EyeOff } from 'lucide-react'
import { ErrorBoundary } from '@/components/error-boundary'
import { LoadingState } from '@/components/ui/loading-state'
import { ErrorDisplay } from '@/components/ui/error-display'
import { 
  useEmailConfig, 
  useUpdateEmailConfig, 
  useTestEmailConfig 
} from '@/hooks/use-api'
import type { UpdateEmailConfigRequest, TestEmailConfigRequest } from '@/lib/types'
import { toast } from 'sonner'

// SMTP端口预设选项
const SMTP_PRESETS = {
  gmail: {
    name: 'Gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
  },
  outlook: {
    name: 'Outlook/Hotmail',
    host: 'smtp.live.com',
    port: 587,
    secure: false,
  },
  qq: {
    name: 'QQ邮箱',
    host: 'smtp.qq.com',
    port: 465,
    secure: true,
  },
  '163': {
    name: '163邮箱',
    host: 'smtp.163.com',
    port: 465,
    secure: true,
  },
  custom: {
    name: '自定义',
    host: '',
    port: 587,
    secure: false,
  }
}

export default function EditEmailConfigPage() {
  const router = useRouter()
  const params = useParams()
  const configId = parseInt(params.id as string)

  const [formData, setFormData] = useState<UpdateEmailConfigRequest>({})
  const [selectedPreset, setSelectedPreset] = useState<string>('custom')
  const [testEmail, setTestEmail] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [passwordChanged, setPasswordChanged] = useState(false)

  // API调用
  const { data: emailConfig, isLoading, error } = useEmailConfig(configId)
  const updateEmailConfigMutation = useUpdateEmailConfig()
  const testEmailConfigMutation = useTestEmailConfig()

  // 初始化表单数据
  useEffect(() => {
    if (emailConfig) {
      setFormData({
        name: emailConfig.name,
        host: emailConfig.host,
        port: emailConfig.port,
        secure: emailConfig.secure,
        authUser: emailConfig.authUser,
        // 密码字段不预填，让用户选择是否更改
        fromEmail: emailConfig.fromEmail,
        fromName: emailConfig.fromName,
        isDefault: emailConfig.isDefault,
        isActive: emailConfig.isActive,
        maxRetries: emailConfig.maxRetries,
        retryDelay: emailConfig.retryDelay,
      })
    }
  }, [emailConfig])

  // 处理预设选择
  const handlePresetChange = (preset: string) => {
    setSelectedPreset(preset)
    const presetConfig = SMTP_PRESETS[preset as keyof typeof SMTP_PRESETS]
    if (presetConfig && preset !== 'custom') {
      setFormData(prev => ({
        ...prev,
        host: presetConfig.host,
        port: presetConfig.port,
        secure: presetConfig.secure,
      }))
    }
  }

  // 处理表单字段变更
  const handleFieldChange = (field: keyof UpdateEmailConfigRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // 如果修改了密码字段，标记密码已更改
    if (field === 'authPass') {
      setPasswordChanged(true)
    }
  }

  // 表单验证
  const validateForm = (): boolean => {
    if (formData.name && !formData.name.trim()) {
      toast.error('配置名称不能为空')
      return false
    }
    if (formData.host && !formData.host.trim()) {
      toast.error('SMTP服务器地址不能为空')
      return false
    }
    if (formData.port && (formData.port < 1 || formData.port > 65535)) {
      toast.error('请输入有效的端口号(1-65535)')
      return false
    }
    if (formData.authUser && !formData.authUser.trim()) {
      toast.error('认证用户名不能为空')
      return false
    }
    if (formData.fromEmail && !formData.fromEmail.trim()) {
      toast.error('发件人邮箱不能为空')
      return false
    }
    if (formData.fromName && !formData.fromName.trim()) {
      toast.error('发件人姓名不能为空')
      return false
    }
    if (formData.maxRetries !== undefined && (formData.maxRetries < 0 || formData.maxRetries > 10)) {
      toast.error('最大重试次数应在0-10之间')
      return false
    }
    if (formData.retryDelay !== undefined && (formData.retryDelay < 10 || formData.retryDelay > 3600)) {
      toast.error('重试延迟应在10-3600秒之间')
      return false
    }

    // 验证邮箱格式
    if (formData.fromEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.fromEmail)) {
        toast.error('请输入有效的发件人邮箱地址')
        return false
      }
    }

    return true
  }

  // 处理保存
  const handleSave = () => {
    if (!validateForm()) return

    updateEmailConfigMutation.mutate(
      { id: configId, data: formData },
      {
        onSuccess: () => {
          toast.success('邮件配置更新成功')
          router.push('/system/email-configs')
        }
      }
    )
  }

  // 处理测试
  const handleTest = () => {
    if (!testEmail.trim()) {
      toast.error('请输入测试邮箱地址')
      return
    }

    const testData: TestEmailConfigRequest = {
      testEmail: testEmail.trim()
    }
    testEmailConfigMutation.mutate(
      { id: configId, data: testData },
      {
        onSuccess: () => {
          toast.success('测试邮件发送成功，请检查收件箱')
        }
      }
    )
  }

  if (isLoading) {
    return <LoadingState />
  }

  if (error || !emailConfig) {
    return <ErrorDisplay error={error || new Error('邮件配置不存在')} />
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">编辑邮件配置</h1>
            <p className="text-sm text-gray-600">修改SMTP邮件服务器配置</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 主要配置表单 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 基本信息 */}
            <Card>
              <CardHeader>
                <CardTitle>基本信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">配置名称</Label>
                    <Input
                      id="name"
                      placeholder="例如：主邮件服务器"
                      value={formData.name || ''}
                      onChange={(e) => handleFieldChange('name', e.target.value || undefined)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>邮箱类型预设</Label>
                    <Select value={selectedPreset} onValueChange={handlePresetChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(SMTP_PRESETS).map(([key, preset]) => (
                          <SelectItem key={key} value={key}>
                            {preset.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SMTP服务器配置 */}
            <Card>
              <CardHeader>
                <CardTitle>SMTP服务器配置</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="host">SMTP服务器地址</Label>
                    <Input
                      id="host"
                      placeholder="smtp.example.com"
                      value={formData.host || ''}
                      onChange={(e) => handleFieldChange('host', e.target.value || undefined)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="port">端口号</Label>
                    <Input
                      id="port"
                      type="number"
                      min="1"
                      max="65535"
                      value={formData.port || ''}
                      onChange={(e) => handleFieldChange('port', parseInt(e.target.value) || undefined)}
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="secure"
                    checked={formData.secure || false}
                    onCheckedChange={(checked) => handleFieldChange('secure', checked)}
                  />
                  <Label htmlFor="secure">使用SSL/TLS加密连接</Label>
                </div>
              </CardContent>
            </Card>

            {/* 认证信息 */}
            <Card>
              <CardHeader>
                <CardTitle>认证信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="authUser">用户名</Label>
                    <Input
                      id="authUser"
                      placeholder="username@example.com"
                      value={formData.authUser || ''}
                      onChange={(e) => handleFieldChange('authUser', e.target.value || undefined)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="authPass">密码</Label>
                    <div className="relative">
                      <Input
                        id="authPass"
                        type={showPassword ? "text" : "password"}
                        placeholder={passwordChanged ? "输入新密码" : "输入密码以更改"}
                        value={formData.authPass || ''}
                        onChange={(e) => handleFieldChange('authPass', e.target.value || undefined)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    {!passwordChanged && (
                      <p className="text-xs text-gray-500">
                        留空则保持当前密码不变
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 发件人信息 */}
            <Card>
              <CardHeader>
                <CardTitle>发件人信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fromEmail">发件人邮箱</Label>
                    <Input
                      id="fromEmail"
                      type="email"
                      placeholder="noreply@example.com"
                      value={formData.fromEmail || ''}
                      onChange={(e) => handleFieldChange('fromEmail', e.target.value || undefined)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fromName">发件人姓名</Label>
                    <Input
                      id="fromName"
                      placeholder="ArgoChainHub"
                      value={formData.fromName || ''}
                      onChange={(e) => handleFieldChange('fromName', e.target.value || undefined)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 侧边栏配置 */}
          <div className="space-y-6">
            {/* 重试设置 */}
            <Card>
              <CardHeader>
                <CardTitle>重试设置</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="maxRetries">最大重试次数</Label>
                  <Input
                    id="maxRetries"
                    type="number"
                    min="0"
                    max="10"
                    value={formData.maxRetries || ''}
                    onChange={(e) => handleFieldChange('maxRetries', parseInt(e.target.value) || undefined)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="retryDelay">重试延迟（秒）</Label>
                  <Input
                    id="retryDelay"
                    type="number"
                    min="10"
                    max="3600"
                    value={formData.retryDelay || ''}
                    onChange={(e) => handleFieldChange('retryDelay', parseInt(e.target.value) || undefined)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 配置选项 */}
            <Card>
              <CardHeader>
                <CardTitle>配置选项</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isDefault"
                    checked={formData.isDefault || false}
                    onCheckedChange={(checked) => handleFieldChange('isDefault', checked)}
                  />
                  <Label htmlFor="isDefault">设为默认配置</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isActive"
                    checked={formData.isActive !== false}
                    onCheckedChange={(checked) => handleFieldChange('isActive', checked)}
                  />
                  <Label htmlFor="isActive">启用配置</Label>
                </div>
              </CardContent>
            </Card>

            {/* 测试配置 */}
            <Card>
              <CardHeader>
                <CardTitle>测试配置</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="testEmail">测试邮箱</Label>
                  <Input
                    id="testEmail"
                    type="email"
                    placeholder="test@example.com"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleTest}
                  disabled={testEmailConfigMutation.isPending}
                  variant="outline"
                  className="w-full"
                >
                  {testEmailConfigMutation.isPending && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  <TestTube className="w-4 h-4 mr-2" />
                  发送测试邮件
                </Button>
              </CardContent>
            </Card>

            {/* 操作按钮 */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <Button
                    onClick={handleSave}
                    disabled={updateEmailConfigMutation.isPending}
                    className="w-full"
                  >
                    {updateEmailConfigMutation.isPending && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    <Save className="w-4 h-4 mr-2" />
                    保存更改
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.back()}
                    className="w-full"
                  >
                    取消
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}