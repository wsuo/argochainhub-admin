'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Globe, Languages } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MultiLangText {
  'zh-CN': string
  'en'?: string
  'es'?: string
}

interface MultiLangInputProps {
  value?: MultiLangText
  onChange?: (value: MultiLangText) => void
  label?: string
  placeholder?: {
    'zh-CN'?: string
    'en'?: string
    'es'?: string
  }
  required?: boolean
  disabled?: boolean
  className?: string
  variant?: 'input' | 'textarea'
  rows?: number
}

const LANGUAGE_CONFIG = {
  'zh-CN': {
    label: '中文',
    flag: '🇨🇳',
    placeholder: '请输入中文内容'
  },
  'en': {
    label: 'English',
    flag: '🇺🇸',
    placeholder: 'Please enter English content'
  },
  'es': {
    label: 'Español',
    flag: '🇪🇸',
    placeholder: 'Por favor ingrese contenido en español'
  }
} as const

export function MultiLangInput({
  value = { 'zh-CN': '' },
  onChange,
  label,
  placeholder = {},
  required = false,
  disabled = false,
  className,
  variant = 'input',
  rows = 4
}: MultiLangInputProps) {
  const [activeLanguage, setActiveLanguage] = useState<keyof MultiLangText>('zh-CN')

  const updateLanguage = (lang: keyof MultiLangText, content: string) => {
    const newValue = { ...value }
    if (content.trim() === '') {
      // 如果内容为空，删除该语言字段（除了中文）
      if (lang !== 'zh-CN') {
        delete newValue[lang]
      } else {
        newValue[lang] = content
      }
    } else {
      newValue[lang] = content
    }
    onChange?.(newValue)
  }

  const getPlaceholder = (lang: keyof MultiLangText) => {
    return placeholder[lang] || LANGUAGE_CONFIG[lang].placeholder
  }

  const hasContent = (lang: keyof MultiLangText) => {
    return value[lang] && value[lang].trim().length > 0
  }

  const getCharacterCount = (lang: keyof MultiLangText) => {
    return value[lang]?.length || 0
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Languages className="h-4 w-4" />
          {label}
          {required && <span className="text-red-500">*</span>}
        </CardTitle>
        
        {/* 语言标签页 */}
        <div className="flex flex-wrap gap-1">
          {Object.entries(LANGUAGE_CONFIG).map(([lang, config]) => {
            const isActive = activeLanguage === lang
            const hasText = hasContent(lang as keyof MultiLangText)
            
            return (
              <Button
                key={lang}
                variant={isActive ? "default" : "outline"}
                size="sm"
                className={cn(
                  "h-7 px-2 text-xs",
                  isActive && "bg-primary text-primary-foreground",
                  !isActive && hasText && "border-green-500 bg-green-50 text-green-700"
                )}
                onClick={() => setActiveLanguage(lang as keyof MultiLangText)}
                type="button"
              >
                <span className="mr-1">{config.flag}</span>
                {config.label}
                {hasText && !isActive && (
                  <Badge 
                    variant="secondary" 
                    className="ml-1 h-4 px-1 text-xs bg-green-100 text-green-700"
                  >
                    ✓
                  </Badge>
                )}
              </Button>
            )
          })}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* 当前激活语言的输入框 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm text-muted-foreground">
              {LANGUAGE_CONFIG[activeLanguage].flag} {LANGUAGE_CONFIG[activeLanguage].label}
              {activeLanguage === 'zh-CN' && required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <span className="text-xs text-muted-foreground">
              {getCharacterCount(activeLanguage)} 字符
            </span>
          </div>
          
          {variant === 'textarea' ? (
            <Textarea
              value={value[activeLanguage] || ''}
              onChange={(e) => updateLanguage(activeLanguage, e.target.value)}
              placeholder={getPlaceholder(activeLanguage)}
              disabled={disabled}
              rows={rows}
              className="min-h-[100px] resize-none"
            />
          ) : (
            <Input
              value={value[activeLanguage] || ''}
              onChange={(e) => updateLanguage(activeLanguage, e.target.value)}
              placeholder={getPlaceholder(activeLanguage)}
              disabled={disabled}
            />
          )}
        </div>
        
        {/* 状态提示 */}
        <div className="mt-3 flex flex-wrap gap-2">
          {Object.entries(LANGUAGE_CONFIG).map(([lang, config]) => {
            const hasText = hasContent(lang as keyof MultiLangText)
            if (!hasText) return null
            
            return (
              <Badge 
                key={lang} 
                variant="outline" 
                className="text-xs bg-green-50 border-green-200 text-green-700"
              >
                {config.flag} {config.label}: {getCharacterCount(lang as keyof MultiLangText)} 字符
              </Badge>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * 公司名称多语言输入组件
 */
interface CompanyNameInputProps {
  value?: MultiLangText
  onChange?: (value: MultiLangText) => void
  required?: boolean
  disabled?: boolean
  className?: string
}

export function CompanyNameInput(props: CompanyNameInputProps) {
  return (
    <MultiLangInput
      {...props}
      label="企业名称"
      variant="input"
      placeholder={{
        'zh-CN': '请输入企业中文名称',
        'en': 'Please enter company name in English',
        'es': 'Por favor ingrese el nombre de la empresa en español'
      }}
      required={true}
    />
  )
}