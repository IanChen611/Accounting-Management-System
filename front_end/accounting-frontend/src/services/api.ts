import apiClient from '@/utils/axios'

// 範例: 使用者相關 API
export const userApi = {
  // 取得使用者列表
  getUsers: () => apiClient.get('/users'),

  // 取得單一使用者
  getUser: (id: string) => apiClient.get(`/users/${id}`),

  // 建立使用者
  createUser: (data: any) => apiClient.post('/users', data),

  // 更新使用者
  updateUser: (id: string, data: any) => apiClient.patch(`/users/${id}`, data),

  // 刪除使用者
  deleteUser: (id: string) => apiClient.delete(`/users/${id}`)
}

// 範例: 認證相關 API
export const authApi = {
  // 登入
  login: (credentials: { email: string; password: string }) =>
    apiClient.post('/auth/login', credentials),

  // 註冊
  register: (data: { email: string; password: string; username: string }) =>
    apiClient.post('/auth/register', data),

  // 登出
  logout: () => {
    localStorage.removeItem('token')
  }
}
