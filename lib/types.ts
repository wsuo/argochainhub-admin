// API响应基础类型
export interface ApiResponse<T> {
  data: T
  meta?: PaginationMeta
}

export interface PaginationMeta {
  totalItems: number
  itemCount: number
  itemsPerPage: number
  totalPages: number
  currentPage: number
}

// 认证相关类型
export interface AdminLoginRequest {
  username: string
  password: string
}

export interface AdminLoginResponse {
  access_token?: string
  accessToken?: string  // 后端实际返回的字段名
  admin: Admin
}

export interface Admin {
  id: number
  username: string
  role: 'super_admin' | 'operations_manager' | 'customer_support'
  lastLoginAt?: string
}

// 企业相关类型
export interface Company {
  id: number
  name: {
    zh: string
    en?: string
    'zh-CN'?: string
  }
  type: 'supplier' | 'buyer' | 'manufacturer' | 'distributor'
  status: 'pending_review' | 'active' | 'disabled'
  profile?: {
    description?: {
      zh: string
      en: string
    }
    address?: string
    phone?: string
    website?: string
  }
  rating?: number
  isTop100?: boolean
  email?: string
  registrationNumber?: string
  address?: string
  contactPerson?: string
  contactPhone?: string
  
  // 新增扩展字段
  country?: string // 国家代码
  businessCategories?: string[] // 业务类别代码列表
  businessScope?: MultiLangText // 业务范围描述
  companySize?: string // 公司规模枚举
  mainProducts?: MultiLangText // 主要产品/采购产品
  mainSuppliers?: MultiLangText // 主要供应商（采购商填写）
  annualImportExportValue?: number // 年进口/出口额（美元）
  taxNumber?: string // 税号
  businessLicenseUrl?: string // 营业执照图片地址
  companyPhotosUrls?: string[] // 公司照片地址列表
  
  createdAt: string
  updatedAt?: string
  users?: User[]
  subscriptions?: Subscription[]
}

export interface User {
  id: number
  username: string
  email: string
  name: string
  phone?: string
  isActive: boolean
  role?: string
  createdAt?: string
  lastLoginAt?: string
  company?: Company
  orders?: Order[]
  inquiries?: Inquiry[]
}

// 产品相关类型
export interface Product {
  id: number
  name: string
  category: string
  activeIngredient: string
  specification: string
  status: 'pending_review' | 'active' | 'rejected' | 'archived'
  description: string
  price: number
  unit: string
  minimumOrder: number
  stockQuantity: number
  supplier: Company
  inquiryItems?: InquiryItem[]
}

export interface InquiryItem {
  id: number
  quantity: number
  inquiry: Inquiry
}

export interface Inquiry {
  id: number
  title: string
  status: 'pending' | 'matched' | 'completed'
}

// 订阅和订单相关类型
export interface Subscription {
  id: number
  type: 'paid' | 'gift'
  status: 'active' | 'expired' | 'cancelled'
  startDate: string
  endDate: string
  plan: Plan
  order?: Order
}

export interface Plan {
  id: number
  name: {
    zh: string
    en: string
  }
  price: number
  durationDays: number
  isActive: boolean
  specs: PlanSpecs
  createdAt?: string
}

export interface PlanSpecs {
  userAccounts: number
  aiQueriesMonthly?: number
  inquiriesMonthly: number
  sampleRequestsMonthly: number
  registrationRequestsMonthly: number
  productsLimit: number
  supportLevel: string
}

export interface Order {
  id: number
  orderNo: string
  planName: string
  amount: number
  status: 'pending_payment' | 'paid' | 'failed' | 'refunded'
  paidAt?: string
  paymentGatewayTxnId?: string
  createdAt: string
  company: Company
  user: User
  plan: Plan
  subscriptions?: Subscription[]
}

// 仪表盘统计类型
export interface DashboardStats {
  totalCompanies: number
  pendingCompanies: number
  totalUsers: number
  totalProducts: number
  pendingProducts: number
  totalInquiries: number
  totalOrders: number
  companyTypeStats: Array<{
    type: string
    count: number
  }>
  inquiryStatusStats: Array<{
    status: string
    count: number
  }>
}

export interface ChartData {
  userGrowth: Array<{
    date: string
    newUsers: number
    totalUsers: number
  }>
  companyRegistration: Array<{
    date: string
    newCompanies: number
    totalCompanies: number
  }>
  revenue: Array<{
    date: string
    revenue: number
    orderCount: number
  }>
  inquiryTrend: Array<{
    date: string
    inquiryCount: number
    matchedCount: number
  }>
  productCategoryStats: Array<{
    category: string
    count: number
    percentage: number
  }>
}

// 工具类型
export interface TranslateRequest {
  text: string
  source_lang: string
  target_lang: string
}

export interface TranslateResponse {
  translated_text: string
}

export interface DetectLanguageRequest {
  text: string
}

export interface DetectLanguageResponse {
  detected_language: string
  confidence: number
}

// API错误类型
export interface ApiError {
  statusCode: number
  message: string
  error: string
}

// 查询参数类型

// 企业审核请求
export interface ReviewRequest {
  approved: boolean
  reason?: string
}

// 企业创建/更新请求
export interface CreateCompanyRequest {
  name: MultiLangText
  type: Company['type']
  status?: Company['status']
  profile?: {
    description?: MultiLangText
    address?: string
    phone?: string
    website?: string
  }
  rating?: number
  isTop100?: boolean
  email?: string
  
  // 新增扩展字段
  country?: string
  businessCategories?: string[]
  businessScope?: MultiLangText
  companySize?: string
  mainProducts?: MultiLangText
  mainSuppliers?: MultiLangText
  annualImportExportValue?: number
  registrationNumber?: string
  taxNumber?: string
  businessLicenseUrl?: string
  companyPhotosUrls?: string[]
}

export interface UpdateCompanyRequest extends Partial<CreateCompanyRequest> {}

export interface ProductQuery {
  page?: number
  limit?: number
  status?: Product['status']
  category?: string
  search?: string
}

export interface OrderQuery {
  page?: number
  limit?: number
  status?: Order['status']
  search?: string
}

export interface UserQuery {
  page?: number
  limit?: number
  search?: string
}

export interface PlanQuery {
  page?: number
  limit?: number
  includeInactive?: boolean
}

// 创建和更新类型
export interface CreatePlanRequest {
  name: {
    zh: string
    en: string
  }
  price: number
  durationDays: number
  isActive: boolean
  specs: PlanSpecs
}

export interface UpdatePlanRequest {
  price?: number
  specs?: Partial<PlanSpecs>
}

export interface CreateSubscriptionRequest {
  companyId: number
  planId: number
  startDate: string
  giftReason: string
}

// 字典管理相关类型
export interface MultiLangText {
  'zh-CN': string
  'en'?: string
  'es'?: string
}

export interface DictionaryCategory {
  id: number
  code: string
  name: MultiLangText
  description?: MultiLangText
  isSystem: boolean
  isActive: boolean
  sortOrder: number
  itemCount?: number
  items?: DictionaryItem[]
  createdAt?: string
  updatedAt?: string
}

export interface DictionaryItem {
  id: number
  code: string
  name: MultiLangText
  description?: MultiLangText
  extraData?: {
    iso2?: string
    iso3?: string
    countryCode?: string
    continent?: string
    flagIcon?: string
    flag?: string
    [key: string]: any
  }
  isSystem: boolean
  isActive: boolean
  sortOrder: number
  parentId?: number
  categoryId: number
  categoryCode?: string
  children?: DictionaryItem[]
  createdAt?: string
  updatedAt?: string
}

// 字典查询参数
export interface DictionaryCategoryQuery {
  page?: number
  limit?: number
  search?: string
  isSystem?: boolean
  isActive?: boolean
}

export interface DictionaryItemQuery {
  page?: number
  limit?: number
  search?: string
  isActive?: boolean
  parentId?: number
}

// 字典创建/更新请求
export interface CreateDictionaryCategoryRequest {
  code: string
  name: MultiLangText
  description?: MultiLangText
  isActive?: boolean
  sortOrder?: number
}

export interface UpdateDictionaryCategoryRequest extends Partial<CreateDictionaryCategoryRequest> {}

export interface CreateDictionaryItemRequest {
  code: string
  name: MultiLangText
  description?: MultiLangText
  extraData?: Record<string, any>
  isActive?: boolean
  sortOrder?: number
  parentId?: number
}

export interface UpdateDictionaryItemRequest extends Partial<CreateDictionaryItemRequest> {}

export interface BatchImportDictionaryItemRequest {
  items: CreateDictionaryItemRequest[]
}

// 文件上传相关类型
export interface UploadFile {
  id: number
  filename: string
  originalName: string
  mimetype: string
  size: number
  storageKey: string
  url: string
  type: 'product_image' | 'company_certificate' | 'sample_document' | 'registration_document' | 'other'
  relatedId?: number
  uploadedById: number
  createdAt: string
  updatedAt: string
}

export interface UploadFileRequest {
  file: File
  type: UploadFile['type']
  relatedId?: number
}

// 扩展查询参数，添加新的筛选字段
export interface CompanyQuery {
  page?: number
  limit?: number
  status?: Company['status']
  type?: Company['type']
  search?: string
  country?: string
  companySize?: string
  businessCategory?: string
}