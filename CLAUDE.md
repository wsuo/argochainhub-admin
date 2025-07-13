# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

请你尽可能的复用组件，本项目 /components 文件夹下面是封装的组件。多复用组件，多复用工具类，要想实现一个功能之前先检查其它模块有没有实现，有没有已经存在的，如果实在没有，在考虑新建。

## 字典数据工具说明

项目提供了完整的字典管理系统和工具函数，用于处理下拉框、选择器等组件的数据源。

### 字典工具函数 (`lib/dictionary-utils.ts`)

**核心Hooks：**
- `useDictionaryOptions(code, includeDisabled?)` - 获取字典选项列表
- `useCountryOptions(includeDisabled?)` - 获取国家选项（含国旗）

**工具函数：**
- `getDictionaryLabel(options, value, defaultLabel?)` - 获取字典标签
- `getDictionaryExtra(options, value, field)` - 获取额外字段
- `getDictionaryLabels(options, values, separator?)` - 批量获取标签

**使用示例：**
```tsx
// 获取业务类型选项
const businessTypes = useDictionaryOptions('business_type')

// 获取国家选项（含国旗）
const countries = useCountryOptions()

// 获取标签文本
const label = getDictionaryLabel(businessTypes, 'manufacturing')
```

### 字典组件 (`components/dictionary-components.tsx`)

**预置组件：**
- `<DictionarySelect />` - 通用字典下拉框
- `<CountrySelect />` - 国家选择器（含国旗）
- `<BusinessTypeSelect />` - 业务类型选择器

**使用示例：**
```tsx
// 业务类型选择
<BusinessTypeSelect 
  value={businessType} 
  onValueChange={setBusinessType} 
/>

// 国家选择（含国旗）
<CountrySelect 
  value={country} 
  onValueChange={setCountry}
  showFlag={true}
/>

// 自定义字典选择
<DictionarySelect 
  code="your_dict_code"
  value={value}
  onValueChange={setValue}
/>
```

**常用字典分类代码：**
- `countries` - 国家字典
- `business_type` - 业务类型

在开发新功能时，优先使用这些字典工具和组件，避免重复实现下拉框数据获取逻辑。

在数据管理页面，筛选条件组件中，一般有搜索输入框和下拉筛选框，搜索框和筛选框都要靠左，右侧是搜索按钮和重置按钮。其中的操作逻辑如下：
1. 搜索输入框，用户输入内容后点击搜索按钮或者按下回车键，调用接口；
2. 筛选框，用户下拉选择后，立即调用接口搜索；
3. 重置按钮，重置所有搜索条件。

## Project Overview

ArgoChainHub智慧农化采购平台后台管理系统 - An admin dashboard for a smart agricultural chemical procurement platform built with Next.js 15, TypeScript, and Tailwind CSS.

## Development Commands

```bash
# Start development server (runs on port 3020)
npm run dev
# or
pnpm dev

# Build for production  
npm run build
# or
pnpm build

# Start production server (runs on port 3020)
npm run start
# or
pnpm start

# Run linting
npm run lint
# or
pnpm lint
```

## Development Server

- **Frontend URL**: http://localhost:3020
- **Backend API URL**: http://localhost:3010/api/v1
- **Backend Swagger Docs**: http://localhost:3010/api/docs
- **Package Manager**: npm (with legacy-peer-deps for compatibility)

## Architecture & Structure

### Tech Stack
- **Framework**: Next.js 15 with App Router
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Icons**: Lucide React
- **Forms**: React Hook Form with Zod validation
- **Package Manager**: pnpm

### Key Components Architecture

**Layout Structure**:
- `app/layout.tsx` - Root layout with sidebar navigation and breadcrumb system
- `components/app-sidebar.tsx` - Main navigation sidebar with role-based menu filtering
- Language: Chinese (zh-CN) interface with English variable names

**Sidebar Navigation System**:
The sidebar uses a role-based access control system with three user roles:
- `super_admin` - Full system access
- `operations_manager` - Business operations and content management
- `customer_support` - Limited access to inquiries and basic operations

Menu items are filtered based on `currentUserRole` and organized into modules:
- 企业管理 (Enterprise Management) - Buyers, suppliers, pending reviews
- 内容管理 (Content Management) - Product/supplier review, AI knowledge base
- 业务运营 (Business Operations) - Inquiries, samples, registrations
- 财务管理 (Financial Management) - Membership plans, orders, revenue
- 系统管理 (System Management) - Admin accounts, roles, logs

### Path Aliases
- `@/components` → `./components`
- `@/lib` → `./lib`  
- `@/hooks` → `./hooks`
- `@/ui` → `./components/ui`

### Styling System
- Uses CSS custom properties for theming (defined in `app/globals.css`)
- Extended Tailwind config with sidebar-specific color tokens
- `cn()` utility function in `lib/utils.ts` combines clsx and tailwind-merge

### Configuration Notes
- ESLint and TypeScript errors are ignored during builds (`next.config.mjs`)
- Images are unoptimized for deployment flexibility
- shadcn/ui configured with neutral base color and CSS variables

### Development Patterns
- All UI components are client-side (`"use client"`)
- Consistent import path aliasing with `@/` prefix
- Role-based component rendering patterns in sidebar
- Badge indicators for pending items (审核待处理)

### File Organization
- `/app` - Next.js app router pages and layouts
- `/components` - Reusable React components
- `/components/ui` - shadcn/ui component library
- `/hooks` - Custom React hooks
- `/lib` - Utility functions and shared logic
- `/public` - Static assets (placeholder images)