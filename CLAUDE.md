# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ArgoChainHub智慧农化采购平台后台管理系统 - An admin dashboard for a smart agricultural chemical procurement platform built with Next.js 15, TypeScript, and Tailwind CSS.

## Development Commands

```bash
# Start development server
pnpm dev

# Build for production  
pnpm build

# Start production server
pnpm start

# Run linting
pnpm lint
```

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