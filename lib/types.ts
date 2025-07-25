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
  name: MultiLangText
  pesticideName: MultiLangText
  supplierId: number
  supplier?: {
    id: number
    name: string
    country: string
  }
  formulation: string // 剂型（字典值）
  toxicity: string | number // 毒性等级（字典code，后端可能返回数字或字符串）
  registrationNumber: string // 登记证号
  registrationHolder: string // 登记证持有人
  effectiveDate: string // 有效截止日期
  firstApprovalDate: string // 首次批准日期
  totalContent: string // 总含量
  activeIngredient1?: ActiveIngredient
  activeIngredient2?: ActiveIngredient
  activeIngredient3?: ActiveIngredient
  minOrderQuantity: number // 最低起订量
  minOrderUnit: string // 起订单位
  details?: {
    productCategory: string // 产品品类
    exportRestrictedCountries: string[] // 出口限制国家
    description: string // 产品描述
    remarks: string // 备注
  }
  isListed: boolean // 是否上架
  status: 'draft' | 'pending_review' | 'active' | 'inactive' | 'rejected' | 'archived'
  controlMethods?: ControlMethod[] // 防治方法
  createdAt: string
  updatedAt: string
}

// 有效成分
export interface ActiveIngredient {
  name: MultiLangText
  content: string // 含量百分比
}

// 防治方法
export interface ControlMethod {
  id: number
  productId?: number
  targetCrop: MultiLangText // 防治作物
  pestDisease: MultiLangText // 防治病虫害
  applicationMethod: MultiLangText // 施用方法
  dosage: MultiLangText // 用药量
  sortOrder: number
  isActive: boolean
  remarks?: string
  createdAt?: string
  updatedAt?: string
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
  search?: string // 产品名称、农药名称、登记证号
  supplierId?: number
  supplierName?: string
  formulation?: string // 剂型（字典值）
  toxicity?: Product['toxicity']
  activeIngredient?: string // 有效成分名称
  registrationNumber?: string
  registrationHolder?: string
  productCategory?: string
  country?: string
  exportRestrictedCountries?: string[] // 出口限制国家
  minOrderQuantityMin?: number // 最低起订量（最小）
  minOrderQuantityMax?: number // 最低起订量（最大）
  isListed?: boolean // 是否上架
  effectiveDateStart?: string // 有效截止日期（开始）
  effectiveDateEnd?: string // 有效截止日期（结束）
  firstApprovalDateStart?: string // 首次批准日期（开始）
  firstApprovalDateEnd?: string // 首次批准日期（结束）
  createdStartDate?: string // 创建开始日期
  createdEndDate?: string // 创建结束日期
  updatedStartDate?: string // 更新开始日期
  updatedEndDate?: string // 更新结束日期
  hasControlMethods?: boolean // 是否有防治方法
  sortBy?: 'createdAt' | 'updatedAt' | 'name' | 'pesticideName' | 'effectiveDate' | 'firstApprovalDate' | 'minOrderQuantity'
  sortOrder?: 'ASC' | 'DESC'
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
export interface CreateProductRequest {
  name: MultiLangText
  pesticideName: MultiLangText
  supplierId: number
  formulation: string // 剂型（字典值）
  toxicity: Product['toxicity']
  registrationNumber: string
  registrationHolder: string
  effectiveDate: string
  firstApprovalDate: string
  totalContent: string
  activeIngredient1?: ActiveIngredient
  activeIngredient2?: ActiveIngredient
  activeIngredient3?: ActiveIngredient
  minOrderQuantity: number
  minOrderUnit: string
  details?: {
    productCategory: string
    exportRestrictedCountries: string[]
    description: string
    remarks: string
  }
  status?: Product['status']
  isListed?: boolean
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {}

export interface CreateControlMethodRequest {
  productId?: number
  targetCrop: MultiLangText
  pestDisease: MultiLangText
  applicationMethod: MultiLangText
  dosage: MultiLangText
  sortOrder?: number
  isActive?: boolean
  remarks?: string
}

export interface UpdateControlMethodRequest extends Partial<CreateControlMethodRequest> {}

export interface BatchCreateControlMethodsRequest {
  controlMethods: CreateControlMethodRequest[]
}

export interface UpdateControlMethodOrderRequest {
  [methodId: string]: number // methodId: sortOrder
}

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

// 批量审核产品请求
export interface BatchReviewProductRequest {
  products: Array<{
    productId: number
    approved: boolean
    reason: string
  }>
}

// 批量审核产品响应
export interface BatchReviewProductResponse {
  total: number
  success: number
  failed: number
  successIds: number[]
  failures: Array<{
    productId: number
    error: string
  }>
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

// 企业用户类型
export interface CompanyUser {
  id: number
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
  email: string
  name: string
  phone?: string
  avatar?: string
  position?: string
  department?: string
  joinedAt: string
  emailVerified: boolean
  role: 'owner' | 'admin' | 'member'
  isActive: boolean
  lastLoginAt?: string | null
  companyId: number
  company?: Company
}

// 企业用户查询参数
export interface CompanyUserQuery {
  page?: number
  limit?: number
  search?: string
  role?: CompanyUser['role']
  department?: string
  position?: string
  isActive?: boolean
  emailVerified?: boolean
  joinedStartDate?: string
  joinedEndDate?: string
  sortBy?: 'createdAt' | 'updatedAt' | 'name' | 'joinedAt'
  sortOrder?: 'ASC' | 'DESC'
}

// 创建企业用户请求
export interface CreateCompanyUserRequest {
  email: string
  name: string
  password: string
  phone?: string
  avatar?: string
  position?: string
  department?: string
  joinedAt?: string
  role?: CompanyUser['role']
  isActive?: boolean
}

// 更新企业用户请求
export interface UpdateCompanyUserRequest {
  name?: string
  phone?: string
  avatar?: string
  position?: string
  department?: string
  joinedAt?: string
  role?: CompanyUser['role']
  isActive?: boolean
  emailVerified?: boolean
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