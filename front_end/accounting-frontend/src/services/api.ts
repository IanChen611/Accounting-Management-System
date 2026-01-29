import apiClient from '@/utils/axios'

// 商品項目型別定義
export interface InvoiceItem {
  id?: number
  productName: string
  quantity: number
  amount: number
  unitPrice?: number
}

// 發票資料型別定義
export interface Invoice {
  id?: number
  invoiceDate: string
  invoiceNumber: string
  customerCode?: string
  buyer: string
  items: InvoiceItem[]
  taxExcludedAmount?: number
  tax?: number
  taxIncludedAmount?: number
  isVoided?: boolean
  isBlank?: boolean
  isDualFormat?: boolean
  createdAt?: string
  updatedAt?: string
}

// 客戶資料型別定義
export interface Customer {
  id?: number
  code: string
  name: string
  zipCode?: string
  address?: string
  phone?: string
  createdAt?: string
  updatedAt?: string
}

// 發票相關 API
export const invoiceApi = {
  // 取得所有發票
  getInvoices: (params?: { page?: number; limit?: number; search?: string; startDate?: string; endDate?: string }) =>
    apiClient.get('/invoices', { params }),

  // 取得單一發票
  getInvoice: (id: number) => apiClient.get(`/invoices/${id}`),

  // 建立發票
  createInvoice: (data: Invoice) => apiClient.post('/invoices', data),

  // 更新發票
  updateInvoice: (id: number, data: Invoice) => apiClient.put(`/invoices/${id}`, data),

  // 刪除發票
  deleteInvoice: (id: number) => apiClient.delete(`/invoices/${id}`),

  // 匯出 CSV
  exportCsv: (params?: { startDate?: string; endDate?: string }) =>
    apiClient.get('/invoices/export/csv', { params, responseType: 'blob' }),

  // 匯出 PDF
  exportPdf: (params?: { startDate?: string; endDate?: string }) =>
    apiClient.get('/invoices/export/pdf', { params, responseType: 'blob' }),

  // 匯出 Excel
  exportExcel: (params?: { startDate?: string; endDate?: string }) =>
    apiClient.get('/invoices/export/excel', { params, responseType: 'blob' }),

  // 取得發票日期限制（根據同字軌的前後一號發票）
  getDateConstraints: (invoiceNumber: string, excludeId?: number) =>
    apiClient.get(`/invoices/date-constraints/${encodeURIComponent(invoiceNumber)}`, {
      params: excludeId !== undefined ? { excludeId } : {}
    })
}

// 客戶相關 API
export const customerApi = {
  // 取得所有客戶
  getCustomers: () => apiClient.get('/customers'),

  // 取得單一客戶
  getCustomer: (id: number) => apiClient.get(`/customers/${id}`),

  // 根據客戶代號查詢
  getCustomerByCode: (code: string) =>
    apiClient.get('/customers/by-code', { params: { code } }),

  // 建立客戶
  createCustomer: (data: Customer) => apiClient.post('/customers', data),

  // 更新客戶
  updateCustomer: (id: number, data: Customer) => apiClient.put(`/customers/${id}`, data),

  // 刪除客戶
  deleteCustomer: (id: number) => apiClient.delete(`/customers/${id}`)
}
