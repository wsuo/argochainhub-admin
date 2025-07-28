import { apiClient } from './api-client'
import { filterQueryParams } from './query-utils'
import type {
  Admin,
  AdminLoginRequest,
  AdminLoginResponse,
  ApiResponse,
  DashboardStats,
  ChartData,
  Company,
  CompanyQuery,
  Product,
  ProductQuery,
  CreateProductRequest,
  UpdateProductRequest,
  ControlMethod,
  CreateControlMethodRequest,
  UpdateControlMethodRequest,
  BatchCreateControlMethodsRequest,
  UpdateControlMethodOrderRequest,
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
  BatchReviewProductRequest,
  BatchReviewProductResponse,
  CompanyUser,
  CompanyUserQuery,
  CreateCompanyUserRequest,
  UpdateCompanyUserRequest,
  Inquiry,
  InquiryQuery,
  InquiryItem,
  InquiryStats,
  SampleRequest,
  SampleRequestQuery,
  SampleRequestStats,
  UpdateSampleRequestStatusRequest,
  RegistrationRequest,
  RegistrationRequestQuery,
  RegistrationRequestStats,
  UpdateRegistrationRequestStatusRequest,
  VipConfig,
  VipConfigQuery,
  VipConfigStats,
  CreateVipConfigRequest,
  UpdateVipConfigRequest,
  BatchToggleVipConfigStatusRequest,
  UpdateVipConfigSortOrderRequest,
  News,
  NewsQuery,
  CreateNewsRequest,
  UpdateNewsRequest,
  NewsListResponse,
  NewsDetailResponse,
} from './types'

// 认证相关API
export const authApi = {
  // 管理员登录
  login: (data: AdminLoginRequest): Promise<AdminLoginResponse> =>
    apiClient.post('/auth/admin/login', data),

  // 获取当前用户信息
  getCurrentUser: (): Promise<Admin> =>
    apiClient.get('/auth/me'),

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

  // 创建产品
  createProduct: (data: CreateProductRequest): Promise<Product> =>
    apiClient.post('/admin/products', data),

  // 更新产品
  updateProduct: (id: number, data: UpdateProductRequest): Promise<Product> =>
    apiClient.put(`/admin/products/${id}`, data),

  // 删除产品
  deleteProduct: (id: number): Promise<void> =>
    apiClient.delete(`/admin/products/${id}`),

  // 审核产品
  reviewProduct: (id: number, data: ReviewRequest): Promise<void> =>
    apiClient.post(`/admin/products/${id}/review`, data),
  
  // 批量审核产品
  batchReviewProduct: (data: BatchReviewProductRequest): Promise<BatchReviewProductResponse> =>
    apiClient.post('/admin/products/batch-review', data),

  // 产品上架
  listProduct: (id: number): Promise<void> =>
    apiClient.patch(`/admin/products/${id}/list`),

  // 产品下架
  unlistProduct: (id: number): Promise<void> =>
    apiClient.patch(`/admin/products/${id}/unlist`),

  // 获取产品的防治方法列表
  getControlMethods: (productId: number): Promise<ControlMethod[]> =>
    apiClient.get(`/admin/products/${productId}/control-methods`),

  // 创建防治方法
  createControlMethod: (productId: number, data: CreateControlMethodRequest): Promise<ControlMethod> =>
    apiClient.post(`/admin/products/${productId}/control-methods`, data),

  // 批量创建防治方法
  batchCreateControlMethods: (productId: number, data: BatchCreateControlMethodsRequest): Promise<ControlMethod[]> =>
    apiClient.post(`/admin/products/${productId}/control-methods/batch`, data),

  // 更新防治方法
  updateControlMethod: (id: number, data: UpdateControlMethodRequest): Promise<ControlMethod> =>
    apiClient.put(`/admin/control-methods/${id}`, data),

  // 删除防治方法
  deleteControlMethod: (id: number): Promise<void> =>
    apiClient.delete(`/admin/control-methods/${id}`),

  // 更新防治方法排序
  updateControlMethodOrder: (productId: number, data: UpdateControlMethodOrderRequest): Promise<void> =>
    apiClient.put(`/admin/products/${productId}/control-methods/order`, data),
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

// 企业用户管理相关API
export const companyUserApi = {
  // 获取企业用户列表
  getCompanyUsers: (companyId: number, query: CompanyUserQuery = {}): Promise<ApiResponse<CompanyUser[]>> =>
    apiClient.get(`/companies/${companyId}/users`, filterQueryParams(query)),

  // 获取企业用户详情
  getCompanyUser: (companyId: number, userId: number): Promise<CompanyUser> =>
    apiClient.get(`/companies/${companyId}/users/${userId}`),

  // 创建企业用户
  createCompanyUser: (companyId: number, data: CreateCompanyUserRequest): Promise<CompanyUser> =>
    apiClient.post(`/companies/${companyId}/users`, data),

  // 更新企业用户信息
  updateCompanyUser: (companyId: number, userId: number, data: UpdateCompanyUserRequest): Promise<CompanyUser> =>
    apiClient.put(`/companies/${companyId}/users/${userId}`, data),

  // 删除企业用户
  deleteCompanyUser: (companyId: number, userId: number): Promise<{ message: string }> =>
    apiClient.delete(`/companies/${companyId}/users/${userId}`),

  // 切换企业用户状态
  toggleCompanyUserStatus: (companyId: number, userId: number): Promise<CompanyUser> =>
    apiClient.patch(`/companies/${companyId}/users/${userId}/toggle-status`),
}

// 询盘相关API（管理员接口）
export const inquiryApi = {
  // 获取询盘列表（管理员）
  getInquiries: (query: InquiryQuery = {}): Promise<ApiResponse<Inquiry[]>> =>
    apiClient.get('/admin/inquiries', filterQueryParams(query)),

  // 获取询盘统计数据（管理员）
  getInquiryStats: (): Promise<InquiryStats> =>
    apiClient.get('/admin/inquiries/stats'),

  // 获取询盘详情（管理员）
  getInquiry: (id: number): Promise<Inquiry> =>
    apiClient.get(`/admin/inquiries/${id}`),

  // 更新询盘状态（管理员）
  updateInquiryStatus: (id: number, data: { 
    status: string; 
    quoteDetails?: any; 
    declineReason?: string; 
    operatedBy?: string; 
  }): Promise<Inquiry> =>
    apiClient.patch(`/admin/inquiries/${id}/status`, data),

  // 删除询盘（管理员软删除）
  deleteInquiry: (id: number): Promise<{ message: string }> =>
    apiClient.delete(`/admin/inquiries/${id}`),
}

// 样品申请相关API（管理员接口）
export const sampleRequestApi = {
  // 获取样品申请列表
  getSampleRequests: (query: SampleRequestQuery = {}): Promise<ApiResponse<SampleRequest[]>> =>
    apiClient.get('/admin/sample-requests', filterQueryParams(query)),
  
  // 获取样品申请统计数据
  getSampleRequestStats: (): Promise<SampleRequestStats> =>
    apiClient.get('/admin/sample-requests/stats'),
  
  // 获取样品申请详情
  getSampleRequest: (id: string): Promise<SampleRequest> =>
    apiClient.get(`/admin/sample-requests/${id}`),
  
  // 更新样品申请状态
  updateSampleRequestStatus: (id: string, data: UpdateSampleRequestStatusRequest): Promise<SampleRequest> =>
    apiClient.patch(`/admin/sample-requests/${id}/status`, data),
  
  // 删除样品申请
  deleteSampleRequest: (id: string): Promise<{ message: string }> =>
    apiClient.delete(`/admin/sample-requests/${id}`),
}

// 登记管理相关API（管理员接口）
export const registrationRequestApi = {
  // 获取登记申请列表
  getRegistrationRequests: (query: RegistrationRequestQuery = {}): Promise<ApiResponse<RegistrationRequest[]>> =>
    apiClient.get('/admin/registration-requests', filterQueryParams(query)),
  
  // 获取登记申请统计数据
  getRegistrationRequestStats: (): Promise<RegistrationRequestStats> =>
    apiClient.get('/admin/registration-requests/stats'),
  
  // 获取登记申请详情
  getRegistrationRequest: (id: string): Promise<RegistrationRequest> =>
    apiClient.get(`/admin/registration-requests/${id}`),
  
  // 更新登记申请状态
  updateRegistrationRequestStatus: (id: string, data: UpdateRegistrationRequestStatusRequest): Promise<RegistrationRequest> =>
    apiClient.patch(`/admin/registration-requests/${id}/status`, data),
  
  // 删除登记申请
  deleteRegistrationRequest: (id: string): Promise<{ message: string }> =>
    apiClient.delete(`/admin/registration-requests/${id}`),
}

// VIP配置管理相关API（管理员接口）
export const vipConfigApi = {
  // 获取VIP配置列表
  getVipConfigs: (query: VipConfigQuery = {}): Promise<ApiResponse<VipConfig[]>> =>
    apiClient.get('/admin/vip-configs', filterQueryParams(query)),
  
  // 获取VIP配置统计数据
  getVipConfigStats: (): Promise<VipConfigStats> =>
    apiClient.get('/admin/vip-configs/statistics'),
  
  // 获取VIP配置详情
  getVipConfig: (id: number): Promise<VipConfig> =>
    apiClient.get(`/admin/vip-configs/${id}`),
  
  // 创建VIP配置
  createVipConfig: (data: CreateVipConfigRequest): Promise<VipConfig> =>
    apiClient.post('/admin/vip-configs', data),
  
  // 更新VIP配置
  updateVipConfig: (id: number, data: UpdateVipConfigRequest): Promise<VipConfig> =>
    apiClient.patch(`/admin/vip-configs/${id}`, data),
  
  // 删除VIP配置
  deleteVipConfig: (id: number): Promise<{ message: string }> =>
    apiClient.delete(`/admin/vip-configs/${id}`),
  
  // 切换VIP配置状态
  toggleVipConfigStatus: (id: number): Promise<VipConfig> =>
    apiClient.post(`/admin/vip-configs/${id}/toggle-status`),
  
  // 批量切换状态
  batchToggleVipConfigStatus: (data: BatchToggleVipConfigStatusRequest): Promise<{ message: string }> =>
    apiClient.post('/admin/vip-configs/batch-toggle-status', data),
  
  // 更新排序
  updateVipConfigSortOrder: (id: number, data: UpdateVipConfigSortOrderRequest): Promise<VipConfig> =>
    apiClient.patch(`/admin/vip-configs/${id}/sort-order`, data),
  
  // 根据平台获取VIP配置
  getVipConfigsByPlatform: (platform: 'supplier' | 'purchaser'): Promise<VipConfig[]> =>
    apiClient.get(`/admin/vip-configs/platform/${platform}`),
}

// 新闻资讯管理相关API（管理员接口）
export const newsApi = {
  // 获取新闻资讯列表
  getNews: (query: NewsQuery = {}): Promise<NewsListResponse> =>
    apiClient.get('/admin/news', filterQueryParams(query)),
  
  // 获取新闻资讯详情
  getNewsById: (id: string): Promise<NewsDetailResponse> =>
    apiClient.get(`/admin/news/${id}`),
  
  // 创建新闻资讯
  createNews: (data: CreateNewsRequest): Promise<NewsDetailResponse> =>
    apiClient.post('/admin/news', data),
  
  // 更新新闻资讯
  updateNews: (id: string, data: UpdateNewsRequest): Promise<NewsDetailResponse> =>
    apiClient.patch(`/admin/news/${id}`, data),
  
  // 删除新闻资讯
  deleteNews: (id: string): Promise<{ success: boolean; message: string }> =>
    apiClient.delete(`/admin/news/${id}`),
  
  // 发布新闻
  publishNews: (id: string): Promise<NewsDetailResponse> =>
    apiClient.post(`/admin/news/${id}/publish`),
  
  // 取消发布新闻
  unpublishNews: (id: string): Promise<NewsDetailResponse> =>
    apiClient.post(`/admin/news/${id}/unpublish`),
}

// 导出所有API
export const api = {
  auth: authApi,
  dashboard: dashboardApi,
  company: companyApi,
  companyUser: companyUserApi,
  product: productApi,
  user: userApi,
  order: orderApi,
  plan: planApi,
  subscription: subscriptionApi,
  utility: utilityApi,
  dictionary: dictionaryApi,
  inquiry: inquiryApi,
  sampleRequest: sampleRequestApi,
  registrationRequest: registrationRequestApi,
  vipConfig: vipConfigApi,
  news: newsApi,
}

export default api