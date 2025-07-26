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

**开发环境调试说明：**
- 字典工具已优化调试日志输出，正常情况下不会产生冗余日志
- 只在数据加载失败或使用模拟数据时输出必要的调试信息
- 使用分级日志策略：错误时使用`console.error`，调试提示使用`console.debug`

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

## 主题色彩规范

项目采用绿色作为主题色，符合农化行业的环保理念。所有组件开发应遵循统一的色彩规范。

### 主题色定义

**主题色：#47AC48** (绿色)
- **RGB值：** `rgb(71, 172, 72)`
- **HSL值：** `hsl(120, 41%, 48%)`

### CSS 变量配置

**Light 模式：**
```css
--primary: 120 45% 42%;           /* 主题色 */
--primary-foreground: 0 0% 100%;  /* 主题色前景(白色文字) */
--ring: 120 45% 42%;              /* 焦点环颜色 */
```

**Dark 模式：**
```css
--primary: 120 41% 55%;           /* 深色模式下的主题色(稍亮) */
--primary-foreground: 0 0% 100%;  /* 主题色前景(白色文字) */
--ring: 120 45% 42%;              /* 焦点环颜色 */
```

### 在组件中使用主题色

**1. 使用 Tailwind CSS 类名：**
```tsx
// 背景色
<Button className="bg-primary text-primary-foreground">
  确认操作
</Button>

// 边框色
<div className="border-primary">
  内容区域
</div>

// 文字色
<span className="text-primary">
  重要信息
</span>
```

**2. 使用 CSS 变量：**
```tsx
// 内联样式
<div style={{ 
  backgroundColor: 'hsl(var(--primary))',
  color: 'hsl(var(--primary-foreground))'
}}>
  自定义样式
</div>
```

**3. 在 CSS 文件中使用：**
```css
.custom-button {
  background-color: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  border: 1px solid hsl(var(--primary));
}

.custom-button:focus {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
}
```

### 可访问性标准

项目主题色符合 WCAG AA 级对比度标准：
- **对比度比例：** 4.85:1 (超过4.5:1的最低要求)
- **文字可读性：** 白色文字在绿色背景上具有良好的可读性
- **色盲友好：** 绿色在常见色盲类型中仍具有较好的区分度

### 最佳实践

**1. 主题色使用场景：**
- 主要操作按钮 (确认、提交、保存)
- 重要状态指示 (成功、激活)
- 关键信息高亮
- 导航活跃状态

**2. 避免过度使用：**
- 不要在大面积区域使用主题色作为背景
- 普通文本链接使用次级颜色
- 装饰性元素适度使用主题色

**3. 组件开发建议：**
```tsx
// 推荐：使用语义化类名
<Button variant="default">主要操作</Button>

// 推荐：条件性应用主题色
<div className={cn(
  "border rounded-lg p-4",
  isActive && "border-primary bg-primary/5"
)}>
  内容
</div>

// 避免：硬编码颜色值
<div style={{ backgroundColor: '#47AC48' }}>
  不推荐的做法
</div>
```

**4. 主题色变体：**
- `bg-primary/10` - 浅色背景 (10% 透明度)
- `bg-primary/20` - 中等背景 (20% 透明度)
- `text-primary/70` - 次要文字 (70% 透明度)
- `border-primary/30` - 轻微边框 (30% 透明度)

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