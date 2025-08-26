// API响应基础类型
export interface ApiResponse<T> {
  success: boolean
  message: string
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
  role: 'super_admin' | 'operations_manager' | 'customer_support' | 'demo_viewer'
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
  inquiryNo: string
  status: 'pending_quote' | 'quoted' | 'confirmed' | 'declined' | 'expired' | 'cancelled'
  details: {
    deliveryLocation: string
    tradeTerms: string
    paymentMethod: string
    buyerRemarks: string
    declineReason?: string
    declinedBy?: string
  }
  quoteDetails?: {
    totalPrice: number
    validUntil: string
    supplierRemarks: string
  }
  deadline: string
  buyer: {
    id: number
    name: {
      'zh-CN': string
      en: string
    }
    contactPerson?: string
    contactPhone?: string
    profile?: {
      address?: string
      phone?: string
      website?: string
    }
  }
  supplier: {
    id: number
    name: {
      'zh-CN': string
      en: string
    }
    contactPerson?: string
    contactPhone?: string
    profile?: {
      address?: string
      phone?: string
      website?: string
    }
  }
  items: InquiryItem[]
  createdAt: string
  updatedAt: string
}

// 询盘查询参数（管理员接口）
export interface InquiryQuery {
  page?: number
  limit?: number
  keyword?: string // 关键字搜索（支持询价单号、买方企业名、供应商企业名、产品名称模糊匹配）
  inquiryNo?: string
  status?: string
  buyerId?: number
  supplierId?: number
  createdStartDate?: string // YYYY-MM-DD
  createdEndDate?: string   // YYYY-MM-DD
}

// 询盘统计数据
export interface InquiryStats {
  pendingQuote: number
  quoted: number
  confirmed: number
  declined: number
  expired: number
  cancelled: number
  total: number
}

// 样品申请相关类型
export interface SampleRequest {
  id: string
  createdAt: string
  updatedAt: string
  sampleReqNo: string
  quantity: string
  unit: string
  status: 'pending_approval' | 'approved' | 'shipped' | 'delivered' | 'rejected' | 'cancelled'
  details: {
    purpose: string
    shippingMethod: string
    shippingAddress: string
    willingnessToPay?: {
      paid: boolean
      amount: number
    }
  }
  trackingInfo?: {
    carrier: string
    trackingNumber: string
  }
  productSnapshot: {
    name: string
    content: string
    category: string
    formulation: string
    activeIngredient: string
  }
  deadline: string
  buyer: {
    id: string
    name: {
      "zh-CN": string
    }
  }
  supplier: {
    id: string
    name: {
      "zh-CN": string
    }
  }
  product: {
    id: string
    name: {
      "zh-CN": string
    }
  }
}

// 样品申请查询参数
export interface SampleRequestQuery {
  page?: number
  limit?: number
  sampleReqNo?: string
  status?: string
  buyerId?: number
  supplierId?: number
  productId?: number
  createdStartDate?: string
  createdEndDate?: string
  keyword?: string // 关键字模糊查询
}

// 样品申请统计数据
export interface SampleRequestStats {
  pendingApproval: number
  approved: number
  shipped: number
  delivered: number
  rejected: number
  cancelled: number
  total: number
}

// 更新样品申请状态请求
export interface UpdateSampleRequestStatusRequest {
  status: string
  operatedBy: string
  trackingInfo?: {
    carrier: string
    trackingNumber: string
  }
  rejectReason?: string
}

// 登记管理相关类型
export interface RegistrationRequest {
  id: string
  regReqNo: string
  status: 'pending_response' | 'in_progress' | 'completed' | 'declined' | 'cancelled'
  details: {
    targetCountry: string
    isExclusive: boolean
    docReqs: string[]
    sampleReq: {
      needed: boolean
      quantity?: number
      unit?: string
    }
    timeline: string
    budget: {
      amount: number
      currency: string
    }
    additionalRequirements?: string
  }
  productSnapshot: {
    name: string
    category: string
    formulation: string
    activeIngredient: string
    content: string
  }
  deadline: string
  buyer: {
    id: string
    name: {
      en?: string
      "zh-CN": string
    }
  }
  supplier: {
    id: string
    name: {
      en?: string
      "zh-CN": string
    }
  }
  product: {
    id: string
    name: {
      en?: string
      "zh-CN": string
    }
  }
  createdAt?: string
  updatedAt?: string
}

// 登记申请查询参数
export interface RegistrationRequestQuery {
  page?: number
  limit?: number
  regReqNo?: string
  status?: string
  buyerId?: number
  supplierId?: number
  productId?: number
  targetCountry?: string
  createdStartDate?: string
  createdEndDate?: string
  keyword?: string // 关键字模糊查询
}

// 登记申请统计数据
export interface RegistrationRequestStats {
  pendingResponse: number
  inProgress: number
  completed: number
  declined: number
  cancelled: number
  total: number
}

// 更新登记申请状态请求
export interface UpdateRegistrationRequestStatusRequest {
  status: string
  statusNote?: string
  operatedBy: string
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

// API错误响应类型
export interface ApiErrorResponse {
  success: false
  message: string
  data?: any
  error?: string
  statusCode?: number
}

// 旧的API错误类型（保持兼容）
export interface ApiError {
  statusCode: number
  message: string
  error: string
  handled?: boolean  // 标记错误是否已被处理（如已显示toast）
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

// VIP配置管理相关类型
export interface VipConfig {
  id: number
  name: {
    "zh-CN": string
    en: string
    es: string
  }
  platform: 'supplier' | 'purchaser'
  level: 'promotion' | 'basic' | 'advanced'
  currency: 'USD' | 'CNY'
  originalPrice: string
  currentPrice: string
  discount?: string
  days: number
  accountQuota: number
  maxPurchaseCount: number
  bonusDays: number
  sampleViewCount: number
  vipLevelNumber: number
  inquiryManagementCount: number
  registrationManagementCount: number
  productPublishCount: number
  viewCount: number
  remarkZh?: string
  remarkEn?: string
  remarkEs?: string
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

// VIP配置查询参数
export interface VipConfigQuery {
  page?: number
  limit?: number
  platform?: 'supplier' | 'purchaser'
  level?: 'promotion' | 'basic' | 'advanced'
  currency?: 'USD' | 'CNY'
  isActive?: boolean
  keyword?: string
}

// VIP配置统计数据
export interface VipConfigStats {
  totalConfigs: number
  activeConfigs: number
  inactiveConfigs: number
  platformStats: Array<{
    platform: string
    count: number
  }>
  levelStats: Array<{
    level: string
    count: number
  }>
  currencyStats: Array<{
    currency: string
    count: number
  }>
}

// 创建VIP配置请求
export interface CreateVipConfigRequest {
  name: {
    "zh-CN": string
    en: string
    es: string
  }
  platform: 'supplier' | 'purchaser'
  level: 'promotion' | 'basic' | 'advanced'
  currency: 'USD' | 'CNY'
  originalPrice: number
  currentPrice: number
  days: number
  accountQuota: number
  maxPurchaseCount: number
  bonusDays: number
  sampleViewCount: number
  vipLevelNumber: number
  inquiryManagementCount: number
  registrationManagementCount: number
  productPublishCount: number
  viewCount: number
  remarkZh?: string
  remarkEn?: string
  remarkEs?: string
  isActive?: boolean
  sortOrder?: number
}

// 更新VIP配置请求
export interface UpdateVipConfigRequest {
  name?: {
    "zh-CN"?: string
    en?: string
    es?: string
  }
  platform?: 'supplier' | 'purchaser'
  level?: 'promotion' | 'basic' | 'advanced'
  currency?: 'USD' | 'CNY'
  originalPrice?: number
  currentPrice?: number
  days?: number
  accountQuota?: number
  maxPurchaseCount?: number
  bonusDays?: number
  sampleViewCount?: number
  vipLevelNumber?: number
  inquiryManagementCount?: number
  registrationManagementCount?: number
  productPublishCount?: number
  viewCount?: number
  remarkZh?: string
  remarkEn?: string
  remarkEs?: string
  isActive?: boolean
  sortOrder?: number
}

// 批量切换状态请求
export interface BatchToggleVipConfigStatusRequest {
  ids: number[]
  isActive: boolean
}

// 更新排序请求
export interface UpdateVipConfigSortOrderRequest {
  sortOrder: number
}

// 新闻资讯相关类型
export interface News {
  id: string
  title: MultiLangText
  content: MultiLangText
  category: string
  coverImage?: string
  sortOrder: number
  isPublished: boolean
  publishedAt?: string
  viewCount: number
  createdAt: string
  updatedAt: string
}

// 新闻查询参数
export interface NewsQuery {
  page?: number
  pageSize?: number
  category?: string
  isPublished?: boolean
  keyword?: string
}

// 创建新闻请求
export interface CreateNewsRequest {
  title: MultiLangText
  content: MultiLangText
  category: string
  coverImage?: string
  sortOrder?: number
  isPublished?: boolean
}

// 更新新闻请求
export interface UpdateNewsRequest {
  title?: MultiLangText
  content?: MultiLangText
  category?: string
  coverImage?: string
  sortOrder?: number
  isPublished?: boolean
}

// 新闻列表响应（特殊格式）
export interface NewsListResponse {
  success: boolean
  data: {
    data: News[]
    total: number
    page: number
    pageSize: number
  }
  message: string
}

// 新闻详情响应
export interface NewsDetailResponse {
  success: boolean
  data: News
  message: string
}

// ==================== 邮件管理相关类型 ====================

// 多语言文本类型
export interface MultiLanguageText {
  'zh-CN': string
  'en': string
  'es'?: string
}

// 支持的语言类型
export type SupportedLanguage = 'zh-CN' | 'en' | 'es'

// 邮件配置类型
export interface EmailConfig {
  id: number
  name: string
  host: string
  port: number
  secure: boolean
  authUser: string
  authPass: string // 显示时为 ******
  fromEmail: string
  fromName: string
  isDefault: boolean
  isActive: boolean
  maxRetries: number
  retryDelay: number // 重试延迟（秒）
  createdAt: string
  updatedAt: string
}

// 邮件配置查询参数
export interface EmailConfigQuery {
  page?: number
  limit?: number
  name?: string
  isDefault?: boolean
  isActive?: boolean
}

// 邮件配置列表响应
export interface EmailConfigListResponse {
  items: EmailConfig[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// 创建邮件配置请求
export interface CreateEmailConfigRequest {
  name: string
  host: string
  port: number
  secure: boolean
  authUser: string
  authPass: string
  fromEmail: string
  fromName: string
  isDefault?: boolean
  maxRetries?: number
  retryDelay?: number
}

// 更新邮件配置请求
export interface UpdateEmailConfigRequest {
  name?: string
  host?: string
  port?: number
  secure?: boolean
  authUser?: string
  authPass?: string
  fromEmail?: string
  fromName?: string
  isDefault?: boolean
  isActive?: boolean
  maxRetries?: number
  retryDelay?: number
}

// 测试邮件配置请求
export interface TestEmailConfigRequest {
  testEmail: string
}

// 测试邮件配置响应
export interface TestEmailConfigResponse {
  success: boolean
  message: string
}

// 邮件模板变量
export interface EmailTemplateVariable {
  name: string
  description: string
  example: string
}

// 邮件模板类型
export interface EmailTemplate {
  id: number
  code: string
  name: MultiLanguageText
  description: MultiLanguageText
  subject: MultiLanguageText
  body: MultiLanguageText
  variables: EmailTemplateVariable[]
  isActive: boolean
  triggerEvent: string
  createdAt: string
  updatedAt: string
}

// 邮件模板查询参数
export interface EmailTemplateQuery {
  page?: number
  limit?: number
  code?: string
  name?: string
  isActive?: boolean
  triggerEvent?: string
}

// 邮件模板列表响应
export interface EmailTemplateListResponse {
  items: EmailTemplate[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// 创建邮件模板请求
export interface CreateEmailTemplateRequest {
  code: string
  name: MultiLanguageText
  description: MultiLanguageText
  subject: MultiLanguageText
  body: MultiLanguageText
  variables: EmailTemplateVariable[]
  triggerEvent: string
}

// 更新邮件模板请求
export interface UpdateEmailTemplateRequest {
  name?: MultiLanguageText
  description?: MultiLanguageText
  subject?: MultiLanguageText
  body?: MultiLanguageText
  variables?: EmailTemplateVariable[]
  isActive?: boolean
  triggerEvent?: string
}

// 预览邮件模板请求
export interface PreviewEmailTemplateRequest {
  variables: Record<string, string>
  language: SupportedLanguage
}

// 预览邮件模板响应
export interface PreviewEmailTemplateResponse {
  subject: string
  body: string
}

// 邮件发送状态
export type EmailStatus = 'pending' | 'sending' | 'sent' | 'failed' | 'retry'

// 邮件发送历史类型
export interface EmailHistory {
  id: number
  template?: {
    id: number
    code: string
    name: MultiLanguageText
  }
  config: {
    id: number
    name: string
    authPass: string // 显示为 ******
  }
  toEmail: string
  toName: string
  ccEmails?: string[]
  bccEmails?: string[]
  subject: string
  body?: string // 详情时返回
  variables?: Record<string, string> // 详情时返回
  language: SupportedLanguage
  status: EmailStatus
  attempts: number
  sentAt?: string
  errorMessage?: string
  relatedType?: string
  relatedId?: number
  createdBy?: number
  createdAt: string
  updatedAt: string
}

// 邮件发送历史查询参数
export interface EmailHistoryQuery {
  page?: number
  limit?: number
  status?: EmailStatus
  toEmail?: string
  relatedType?: string
  relatedId?: number
  startDate?: string
  endDate?: string
}

// 邮件发送历史列表响应
export interface EmailHistoryListResponse {
  items: EmailHistory[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// 发送邮件请求（使用模板）
export interface SendEmailRequest {
  templateId: number
  toEmail: string
  toName: string
  variables: Record<string, string>
  language: SupportedLanguage
  relatedType?: string
  relatedId?: number
  ccEmails?: string[]
  bccEmails?: string[]
}

// 发送邮件请求（直接发送）
export interface SendDirectEmailRequest {
  toEmail: string
  toName: string
  subject: string
  body: string
  language: SupportedLanguage
  ccEmails?: string[]
  bccEmails?: string[]
}

// 重新发送邮件请求
export interface ResendEmailRequest {
  configId?: number // 可选，使用其他邮件配置
}

// 邮件统计状态计数
export interface EmailStatusCount {
  status: EmailStatus
  count: string
}

// 邮件日统计
export interface EmailDailyCount {
  date: string
  count: string
}

// 邮件模板使用统计
export interface EmailTemplateUsage {
  templateId: string
  templateCode: string
  templateName: MultiLanguageText
  count: string
}

// 邮件统计响应
export interface EmailStatisticsResponse {
  statusCounts: EmailStatusCount[]
  dailyCounts: EmailDailyCount[]
  templateUsage: EmailTemplateUsage[]
  period: {
    startDate: string
    endDate: string
    days: number
  }
}

// 农药相关类型
export interface Pesticide {
  id: number | string
  category: 'insecticide' | 'herbicide' | 'fungicide' | 'acaricide' | 'plant_growth_regulator' | 'rodenticide' | 'other'
  formulation: string // 剂型
  productName: MultiLangText
  concentration: string // 浓度规格
  isVisible: boolean
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
  // 最新价格信息
  latestPrice?: {
    unitPrice: number
    weekEndDate: string
  } | null
}

// 农药查询参数
export interface PesticideQuery {
  page?: number
  limit?: number
  category?: string
  formulation?: string
  isVisible?: boolean
  hasPrice?: boolean
  search?: string
}

// 创建农药请求
export interface CreatePesticideRequest {
  category: string
  formulation: string
  productName: MultiLangText
  concentration: string
  isVisible?: boolean
}

// 更新农药请求
export interface UpdatePesticideRequest {
  category?: string
  formulation?: string
  productName?: MultiLangText
  concentration?: string
  isVisible?: boolean
}

// 价格走势
export interface PriceTrend {
  id: number
  pesticideId: number
  pesticide?: Pesticide
  weekEndDate: string // YYYY-MM-DD
  unitPrice: number // 人民币单价
  exchangeRate: number // 汇率
  usdPrice?: number // 美元价格（计算得出）
  createdAt: string
  updatedAt: string
}

// 价格走势查询参数
export interface PriceTrendQuery {
  page?: number
  limit?: number
  pesticideId?: number
  startDate?: string
  endDate?: string
  sortBy?: 'weekEndDate' | 'unitPrice' | 'exchangeRate' | 'createdAt'
  sortOrder?: 'ASC' | 'DESC'
}

// 创建价格走势请求
export interface CreatePriceTrendRequest {
  pesticideId: number
  weekEndDate: string
  unitPrice: number
  exchangeRate: number
}

// 更新价格走势请求
export interface UpdatePriceTrendRequest {
  weekEndDate?: string
  unitPrice?: number
  exchangeRate?: number
}

// 价格走势图表数据
export interface PriceTrendChartData {
  pesticide: Pesticide
  priceData: Array<{
    date: string
    cnyPrice: number
    usdPrice: number
    exchangeRate: number
  }>
}

// 图片解析请求
export interface ImageParseRequest {
  images: File[]
  exchangeRate: number
}

// 图片解析响应（旧格式，已废弃）
export interface ImageParseResponse {
  totalImages: number
  totalParsedData: number
  successfulSaves: number
  failedSaves: number
  parsedData: Array<{
    productName: string
    weekEndDate: string
    unitPrice: number
  }>
  errors?: string[]
}

// 🆕 新的异步图片解析响应
export interface ImageParseTaskResponse {
  taskId: string
  totalImages: number
  estimatedTime: string
}

// 🆕 任务状态类型
export type TaskStatus = 'processing' | 'completed' | 'failed'

// 🆕 图片解析结果
export interface ImageParseResult {
  imageIndex: number
  imageName: string
  imageUrl: string
  parseStatus: 'success' | 'failed'  
  parsedData: Array<{
    productName: string
    weekEndDate: string
    unitPrice: number
  }>
  errorMessage?: string
}

// 🆕 任务状态查询响应
export interface TaskStatusResponse {
  taskId: string
  status: TaskStatus
  totalImages: number
  processedImages: number
  totalParsedData: number
  progress: number // 0-100
  imageResults: ImageParseResult[]
  globalErrors: string[]
  createdAt: string
  completedAt?: string
}

// 🆕 保存价格数据请求
export interface SavePriceDataRequest {
  taskId?: string
  exchangeRate: number
  priceData: Array<{
    productName: string
    weekEndDate: string
    unitPrice: number
  }>
}

// 🆕 保存价格数据响应
export interface SavePriceDataResponse {
  operationSuccess: boolean
  totalItems: number
  successfulSaves: number
  failedSaves: number
  savedData: Array<{
    productName: string
    weekEndDate: string
    unitPrice: number
  }>
  errors: string[]
}

// ==================== 管理员通知系统相关类型 ====================

// 通知优先级
export type AdminNotificationPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT' | 'CRITICAL'

// 通知分类
export type AdminNotificationCategory = 'review' | 'business' | 'operation' | 'system' | 'security'

// 通知状态
export type AdminNotificationStatus = 'UNREAD' | 'READ' | 'ARCHIVED'

// 管理员通知类型
export interface AdminNotification {
  id: number | string
  type: string // 通知类型，对应字典 admin_notification_type
  title: string
  content: string
  priority: AdminNotificationPriority
  category: AdminNotificationCategory
  status: AdminNotificationStatus
  data?: Record<string, any> // 通知携带的额外数据
  readAt?: string | null
  archivedAt?: string | null
  expiresAt?: string | null
  adminUserId: number
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

// 管理员通知查询参数
export interface AdminNotificationQuery {
  page?: number
  limit?: number
  status?: AdminNotificationStatus
  priority?: AdminNotificationPriority
  category?: AdminNotificationCategory
  type?: string // 具体的通知类型，对应字典 admin_notification_type
}

// 未读通知数量响应
export interface UnreadNotificationCountResponse {
  count: number
}

// 按优先级分组的未读数量响应
export interface UnreadCountByPriorityResponse {
  CRITICAL?: number
  URGENT?: number
  HIGH?: number
  NORMAL?: number
  LOW?: number
}

// 标记通知已读请求
export interface MarkNotificationReadRequest {
  // 空请求体，通过路径参数传递ID
}

// 标记所有通知已读请求
export interface MarkAllNotificationsReadRequest {
  // 空请求体
}

// 归档通知请求
export interface ArchiveNotificationRequest {
  // 空请求体，通过路径参数传递ID
}

// 广播通知请求（需要管理权限）
export interface BroadcastNotificationRequest {
  type: string
  title: string
  content: string
  priority: AdminNotificationPriority
  category: AdminNotificationCategory
  data?: Record<string, any>
}

// 权限通知请求（需要管理权限）
export interface PermissionNotificationRequest {
  requiredPermissions: string[]
  type: string
  title: string
  content: string
  priority: AdminNotificationPriority
  category: AdminNotificationCategory
  data?: Record<string, any>
}

// 系统告警请求（需要系统配置权限）
export interface SystemAlertRequest {
  alertType: string // 如 'MEMORY_WARNING', 'CPU_CRITICAL', 'DISK_FULL'
  message: string
  level: 'warning' | 'error' | 'critical'
}

// Socket.IO 消息类型（简化版本）
export interface WebSocketMessage {
  type: string
  [key: string]: any
}

// Socket.IO 通知消息
export interface WebSocketNotificationMessage {
  type: 'notification'
  id: number
  notificationType: string
  title: string
  content: string
  priority: AdminNotificationPriority
  category: AdminNotificationCategory
  data?: Record<string, any>
  createdAt: string
}

// Socket.IO 未读数量更新消息
export interface WebSocketUnreadCountMessage {
  type: 'unread_count_update'
  count: number
}

// 筛选树节点结构
export interface FilterTreeNode {
  label: string  // 显示文本
  value: string  // 实际值
  children?: FilterTreeNode[]  // 子节点（仅根节点有）
}

// 筛选树响应
export interface FilterTreeResponse {
  success: boolean
  message: string
  data: FilterTreeNode[]
}