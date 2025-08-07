# CLAUDE.md

不要每次修改完代码都 npm run build

## 核心开发约束

### 1. 代码复用原则 (必须遵守)
- **严禁重复造轮子**：实现功能前必须先检查 `/components` 目录下的现有组件
- **严禁硬编码数据**：下拉框、选择器必须使用字典系统 (`useDictionaryOptions`)
- **严禁新建孤立文件**：测试文件整合到 `tests/` 目录，文档更新现有文件

### 2. 字典数据使用 (强制要求)
```tsx
// ✅ 正确使用
const categories = useDictionaryOptions('product_category')
const formulations = useDictionaryOptions('formulation')

// ❌ 禁止硬编码
const categories = [{ value: 'herbicide', label: '除草剂' }]
```

**常用字典代码：**
- `product_category` - 产品类别
- `formulation` - 剂型
- `business_type` - 业务类型
- `countries` - 国家

### 3. 主题色规范 (设计约束)
- **主题色：** `#47AC48` (绿色)
- **使用方式：** `bg-primary`、`text-primary`、`border-primary`
- **变体：** `bg-primary/10`、`text-primary/70`

### 4. API 接口对接 (技术约束)
```typescript
// ✅ 分页接口使用 getWithMeta
const companies = await apiClient.getWithMeta<Company[]>('/admin/companies')
const { data, meta } = companies  // data: 数据, meta: 分页信息

// ✅ 单条记录使用 get  
const company = await apiClient.get<Company>('/admin/companies/1')

// 统一响应格式
interface ApiResponse<T> {
  success: boolean
  message: string  
  data: T
  meta?: PaginationMeta
}
```

### 5. 筛选组件布局 (UI 约束)
- 搜索框、筛选框靠左
- 搜索按钮、重置按钮靠右
- 筛选框选择后立即触发搜索
- 搜索框支持回车键触发

## 项目信息
- **框架：** Next.js 15 + TypeScript + Tailwind CSS
- **前端端口：** 3060
- **后端API：** http://localhost:3050/api/v1
- **包管理：** pnpm