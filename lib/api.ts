import { apiClient } from './api-client'
import { filterQueryParams } from './query-utils'
import type {
  AdminLoginRequest,
  AdminLoginResponse,
  ApiResponse,
  DashboardStats,
  ChartData,
  Company,
  CompanyQuery,
  Product,
  ProductQuery,
  User,
  UserQuery,
  Order,
  OrderQuery,
  Plan,
  PlanQuery,
  CreatePlanRequest,
  UpdatePlanRequest,
  Subscription,
  CreateSubscriptionRequest,
  ReviewRequest,
  CreateCompanyRequest,
  UpdateCompanyRequest,
  TranslateRequest,
  TranslateResponse,
  DetectLanguageRequest,
  DetectLanguageResponse,
  DictionaryCategory,
  DictionaryCategoryQuery,
  DictionaryItem,
  DictionaryItemQuery,
  CreateDictionaryCategoryRequest,
  UpdateDictionaryCategoryRequest,
  CreateDictionaryItemRequest,
  UpdateDictionaryItemRequest,
  BatchImportDictionaryItemRequest,
} from './types'

// 认证相关API
export const authApi = {
  // 管理员登录
  login: (data: AdminLoginRequest): Promise<AdminLoginResponse> =>
    apiClient.post('/auth/admin/login', data),

  // 登出
  logout: () => {
    apiClient.clearAuth()
    return Promise.resolve()
  },
}

// 仪表盘相关API
export const dashboardApi = {
  // 获取KPI统计数据
  getStats: (): Promise<DashboardStats> =>
    apiClient.get('/admin/stats'),

  // 获取图表数据
  getCharts: (): Promise<ChartData> =>
    apiClient.get('/admin/dashboard/charts'),
}

// 企业管理相关API
export const companyApi = {
  // 获取所有企业列表
  getCompanies: (query: CompanyQuery = {}): Promise<ApiResponse<Company[]>> =>
    apiClient.get('/admin/companies', filterQueryParams(query)),

  // 获取待审核企业列表
  getPendingCompanies: (query: Omit<CompanyQuery, 'status'> = {}): Promise<ApiResponse<Company[]>> =>
    apiClient.get('/admin/companies/pending', filterQueryParams(query)),

  // 获取企业详情
  getCompany: (id: number): Promise<Company> =>
    apiClient.get(`/admin/companies/${id}`),

  // 审核企业
  reviewCompany: (id: number, data: ReviewRequest): Promise<void> =>
    apiClient.post(`/admin/companies/${id}/review`, data),

  // 切换企业状态
  toggleCompanyStatus: (id: number): Promise<void> =>
    apiClient.patch(`/admin/companies/${id}/toggle-status`),

  // 获取企业订阅历史
  getCompanySubscriptions: (id: number, query: { page?: number; limit?: number } = {}): Promise<ApiResponse<Subscription[]>> =>
    apiClient.get(`/admin/companies/${id}/subscriptions`, query),

  // 创建企业
  createCompany: (data: CreateCompanyRequest): Promise<Company> =>
    apiClient.post('/admin/companies', data),

  // 更新企业信息
  updateCompany: (id: number, data: UpdateCompanyRequest): Promise<Company> =>
    apiClient.put(`/admin/companies/${id}`, data),
}

// 产品管理相关API
export const productApi = {
  // 获取所有产品列表
  getProducts: (query: ProductQuery = {}): Promise<ApiResponse<Product[]>> =>
    apiClient.get('/admin/products', filterQueryParams(query)),

  // 获取待审核产品列表
  getPendingProducts: (query: Omit<ProductQuery, 'status'> = {}): Promise<ApiResponse<Product[]>> =>
    apiClient.get('/admin/products/pending', filterQueryParams(query)),

  // 获取产品详情
  getProduct: (id: number): Promise<Product> =>
    apiClient.get(`/admin/products/${id}`),

  // 审核产品
  reviewProduct: (id: number, data: ReviewRequest): Promise<void> =>
    apiClient.post(`/admin/products/${id}/review`, data),

  // 切换产品状态
  toggleProductStatus: (id: number): Promise<void> =>
    apiClient.patch(`/admin/products/${id}/toggle-status`),
}

// 用户管理相关API
export const userApi = {
  // 获取所有用户列表
  getUsers: (query: UserQuery = {}): Promise<ApiResponse<User[]>> =>
    apiClient.get('/admin/users', filterQueryParams(query)),

  // 获取用户详情
  getUser: (id: number): Promise<User> =>
    apiClient.get(`/admin/users/${id}`),
}

// 订单管理相关API
export const orderApi = {
  // 获取所有订单列表
  getOrders: (query: OrderQuery = {}): Promise<ApiResponse<Order[]>> =>
    apiClient.get('/admin/orders', filterQueryParams(query)),

  // 获取订单详情
  getOrder: (id: number): Promise<Order> =>
    apiClient.get(`/admin/orders/${id}`),
}

// 会员计划管理相关API
export const planApi = {
  // 获取所有会员计划
  getPlans: (query: PlanQuery = {}): Promise<ApiResponse<Plan[]>> =>
    apiClient.get('/admin/plans', filterQueryParams(query)),

  // 创建会员计划
  createPlan: (data: CreatePlanRequest): Promise<Plan> =>
    apiClient.post('/admin/plans', data),

  // 更新会员计划
  updatePlan: (id: number, data: UpdatePlanRequest): Promise<Plan> =>
    apiClient.put(`/admin/plans/${id}`, data),

  // 上架/下架会员计划
  togglePlanStatus: (id: number): Promise<void> =>
    apiClient.patch(`/admin/plans/${id}/status`),
}

// 订阅管理相关API
export const subscriptionApi = {
  // 手动赠送订阅
  createSubscription: (data: CreateSubscriptionRequest): Promise<Subscription> =>
    apiClient.post(`/admin/companies/${data.companyId}/subscriptions`, data),

  // 取消订阅
  cancelSubscription: (id: number): Promise<void> =>
    apiClient.delete(`/admin/subscriptions/${id}`),
}

// 工具相关API
export const utilityApi = {
  // 文本翻译
  translate: (data: TranslateRequest): Promise<{ data: TranslateResponse }> =>
    apiClient.post('/admin/utilities/translate', data),

  // 语言检测
  detectLanguage: (data: DetectLanguageRequest): Promise<{ data: DetectLanguageResponse }> =>
    apiClient.post('/admin/utilities/detect-language', data),
}

// 字典管理相关API
export const dictionaryApi = {
  // 字典分类管理
  getCategories: (query: DictionaryCategoryQuery = {}): Promise<ApiResponse<DictionaryCategory[]>> =>
    apiClient.get('/admin/dictionaries/categories', filterQueryParams(query)),

  getCategory: (code: string): Promise<DictionaryCategory> =>
    apiClient.get(`/admin/dictionaries/categories/${code}`),

  createCategory: (data: CreateDictionaryCategoryRequest): Promise<DictionaryCategory> =>
    apiClient.post('/admin/dictionaries/categories', data),

  updateCategory: (id: number, data: UpdateDictionaryCategoryRequest): Promise<DictionaryCategory> =>
    apiClient.put(`/admin/dictionaries/categories/${id}`, data),

  deleteCategory: (id: number): Promise<void> =>
    apiClient.delete(`/admin/dictionaries/categories/${id}`),

  // 字典项管理
  getCategoryItems: (code: string, query: DictionaryItemQuery = {}): Promise<ApiResponse<DictionaryItem[]>> =>
    apiClient.get(`/admin/dictionaries/${code}/items`, filterQueryParams(query)),

  createItem: (code: string, data: CreateDictionaryItemRequest): Promise<DictionaryItem> =>
    apiClient.post(`/admin/dictionaries/${code}/items`, data),

  updateItem: (id: number, data: UpdateDictionaryItemRequest): Promise<DictionaryItem> =>
    apiClient.put(`/admin/dictionaries/items/${id}`, data),

  deleteItem: (id: number): Promise<void> =>
    apiClient.delete(`/admin/dictionaries/items/${id}`),

  batchImport: (code: string, data: BatchImportDictionaryItemRequest): Promise<DictionaryItem[]> =>
    apiClient.post(`/admin/dictionaries/${code}/batch`, data),

  // 前端查询接口（无需认证）
  getDictionary: (code: string): Promise<DictionaryItem[]> =>
    apiClient.get(`/dictionaries/${code}`),

  getCountriesWithFlags: (): Promise<DictionaryItem[]> =>
    apiClient.get('/dictionaries/countries/with-flags'),
}

// 导出所有API
export const api = {
  auth: authApi,
  dashboard: dashboardApi,
  company: companyApi,
  product: productApi,
  user: userApi,
  order: orderApi,
  plan: planApi,
  subscription: subscriptionApi,
  utility: utilityApi,
  dictionary: dictionaryApi,
}

export default api