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
  access_token: string
  admin: Admin
}

export interface Admin {
  id: number
  username: string
  role: 'super_admin' | 'operations_manager' | 'customer_support'
}

// 企业相关类型
export interface Company {
  id: number
  name: {
    zh: string
    en?: string
  }
  email: string
  type: 'manufacturer' | 'distributor' | 'buyer'
  status: 'pending_review' | 'active' | 'disabled'
  registrationNumber?: string
  address?: string
  contactPerson?: string
  contactPhone?: string
  createdAt: string
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

// 审核操作类型
export interface ReviewRequest {
  approved: boolean
  reason: string
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
export interface CompanyQuery {
  page?: number
  limit?: number
  status?: Company['status']
  type?: Company['type']
  search?: string
}

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