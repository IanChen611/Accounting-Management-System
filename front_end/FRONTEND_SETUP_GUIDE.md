# 前端設定指南 (Vue 3)

## 📋 快速開始

### 1. 安裝依賴
```bash
cd front_end/accounting-frontend
npm install
```

### 2. 設定環境變數

編輯 `.env` 檔案:
```env
VITE_API_BASE_URL=http://localhost:3001
```

### 3. 啟動開發伺服器

```bash
npm run dev
```

**成功輸出**:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

開啟瀏覽器訪問 `http://localhost:5173/`

---

## 🛠️ 常用指令

### 開發指令
```bash
# 啟動開發伺服器
npm run dev

# 正式環境建置
npm run build

# 預覽建置結果
npm run preview
```

### 程式碼品質
```bash
# TypeScript 型別檢查
npm run type-check

# 程式碼檢查
npm run lint

# 程式碼格式化
npm run format
```

---

## 📦 已安裝的套件

### 核心套件
- `vue` (^3.5.x) - Vue 3 框架
- `typescript` (~5.9.x) - TypeScript 支援

### 路由和狀態管理
- `vue-router` (^4.6.x) - 路由管理
- `pinia` (^3.0.x) - 狀態管理

### HTTP 請求
- `axios` (^1.x) - HTTP 請求

### UI 元件庫
- `element-plus` (^2.x) - UI 元件庫
- `@element-plus/icons-vue` (^2.x) - Element Plus 圖示

### 開發工具
- `vite` (^7.x) - 建置工具
- `@vitejs/plugin-vue` - Vue 插件
- `eslint` - 程式碼檢查
- `prettier` - 程式碼格式化

---

## 📁 專案結構

```
accounting-frontend/
├── src/
│   ├── main.ts                 # 應用程式入口
│   ├── App.vue                 # 根元件
│   ├── router/
│   │   └── index.ts            # 路由設定
│   ├── stores/
│   │   └── counter.ts          # Pinia store 範例
│   ├── views/                  # 頁面元件
│   ├── components/             # 共用元件
│   ├── utils/
│   │   └── axios.ts            # Axios 設定 (已設定攔截器)
│   ├── services/
│   │   └── api.ts              # API 服務範例
│   └── assets/                 # 靜態資源
├── public/                     # 公開資源
├── .env                        # 環境變數
├── index.html                  # HTML 入口
├── package.json                # 專案依賴
├── tsconfig.json               # TypeScript 設定
└── vite.config.ts              # Vite 設定
```

---

## 🔧 核心檔案說明

### src/utils/axios.ts
Axios 設定,已實作:
- ✅ Base URL 設定 (從環境變數讀取)
- ✅ 請求攔截器 (自動加入 JWT token)
- ✅ 回應攔截器 (401 自動導向登入頁)
- ✅ 錯誤處理

### src/services/api.ts
API 服務範例,包含:
- ✅ 使用者相關 API
- ✅ 認證相關 API (登入、註冊、登出)

### .env
環境變數:
- ✅ `VITE_API_BASE_URL` - 後端 API 位址

---

## 🚀 開發流程

### 1. 建立新頁面

在 `src/views/LoginView.vue`:
```vue
<script setup lang="ts">
import { ref } from 'vue'
import { authApi } from '@/services/api'
import { ElMessage } from 'element-plus'

const email = ref('')
const password = ref('')

const handleLogin = async () => {
  try {
    const response = await authApi.login({
      email: email.value,
      password: password.value
    })
    localStorage.setItem('token', response.access_token)
    ElMessage.success('登入成功')
  } catch (error) {
    ElMessage.error('登入失敗')
  }
}
</script>

<template>
  <div class="login-container">
    <el-form>
      <el-form-item label="Email">
        <el-input v-model="email" type="email" />
      </el-form-item>
      <el-form-item label="密碼">
        <el-input v-model="password" type="password" />
      </el-form-item>
      <el-button type="primary" @click="handleLogin">登入</el-button>
    </el-form>
  </div>
</template>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 100px auto;
}
</style>
```

### 2. 設定路由

在 `src/router/index.ts`:
```typescript
import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

// 路由守衛 - 檢查登入狀態
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')

  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router
```

### 3. 建立 Pinia Store

在 `src/stores/user.ts`:
```typescript
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || '')

  function setUser(userData: any) {
    user.value = userData
  }

  function setToken(newToken: string) {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  function logout() {
    user.value = null
    token.value = ''
    localStorage.removeItem('token')
  }

  return { user, token, setUser, setToken, logout }
})
```

### 4. 在元件中使用 Store

```vue
<script setup lang="ts">
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}
</script>

<template>
  <div>
    <p>歡迎, {{ userStore.user?.username }}</p>
    <el-button @click="handleLogout">登出</el-button>
  </div>
</template>
```

### 5. 使用 Element Plus 元件

```vue
<script setup lang="ts">
import { ElButton, ElMessage } from 'element-plus'

const showMessage = () => {
  ElMessage.success('操作成功')
}
</script>

<template>
  <el-button type="primary" @click="showMessage">
    點擊我
  </el-button>
</template>
```

---

## 🧪 API 呼叫範例

### GET 請求
```typescript
import { userApi } from '@/services/api'

// 取得所有使用者
const users = await userApi.getUsers()

// 取得單一使用者
const user = await userApi.getUser('user-id-123')
```

### POST 請求
```typescript
import { userApi } from '@/services/api'

// 建立使用者
const newUser = await userApi.createUser({
  email: 'test@example.com',
  password: '123456',
  username: 'Test User'
})
```

### 帶 Token 的請求
```typescript
// axios.ts 已自動處理,不需要手動加入 token
// 只要 localStorage 中有 'token',就會自動加入到請求 header
const response = await apiClient.get('/protected-route')
```

### 錯誤處理
```typescript
import { ElMessage } from 'element-plus'
import { authApi } from '@/services/api'

try {
  const response = await authApi.login({ email, password })
  ElMessage.success('登入成功')
} catch (error: any) {
  if (error.response?.status === 401) {
    ElMessage.error('帳號或密碼錯誤')
  } else {
    ElMessage.error('發生錯誤,請稍後再試')
  }
}
```

---

## 🎨 Element Plus 使用範例

### 1. 表單
```vue
<template>
  <el-form :model="form" label-width="120px">
    <el-form-item label="使用者名稱">
      <el-input v-model="form.username" />
    </el-form-item>
    <el-form-item label="Email">
      <el-input v-model="form.email" type="email" />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="onSubmit">送出</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

const form = reactive({
  username: '',
  email: ''
})

const onSubmit = () => {
  console.log('form:', form)
}
</script>
```

### 2. 表格
```vue
<template>
  <el-table :data="tableData" style="width: 100%">
    <el-table-column prop="id" label="ID" width="180" />
    <el-table-column prop="name" label="名稱" width="180" />
    <el-table-column prop="email" label="Email" />
  </el-table>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const tableData = ref([
  { id: 1, name: '張三', email: 'zhang@example.com' },
  { id: 2, name: '李四', email: 'li@example.com' }
])
</script>
```

### 3. 對話框
```vue
<template>
  <el-button @click="dialogVisible = true">開啟對話框</el-button>

  <el-dialog v-model="dialogVisible" title="提示">
    <span>這是一段訊息</span>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="dialogVisible = false">確定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const dialogVisible = ref(false)
</script>
```

---

## ⚠️ 常見問題

### Q1: CORS 錯誤

**錯誤**:
```
Access to XMLHttpRequest at 'http://localhost:3001/users' from origin 'http://localhost:5173'
has been blocked by CORS policy
```

**解決**:
1. 確認後端已啟動
2. 檢查後端 `main.ts` 中的 CORS 設定:
   ```typescript
   app.enableCors({
     origin: 'http://localhost:5173',
     credentials: true,
   });
   ```

### Q2: API 連線失敗

**錯誤**:
```
Network Error
```

**解決**:
1. 確認後端在 `http://localhost:3001` 運行
2. 檢查 `.env` 中的 `VITE_API_BASE_URL`
3. 測試後端:
   ```bash
   curl http://localhost:3001
   ```

### Q3: Token 無效 (401)

**錯誤**:
```
Unauthorized
```

**解決**:
1. 檢查 localStorage 中是否有 token:
   ```javascript
   console.log(localStorage.getItem('token'))
   ```
2. 確認 token 格式正確
3. 檢查 axios 攔截器是否正確加入 token

### Q4: Element Plus 元件無法使用

**錯誤**:
```
Failed to resolve component: el-button
```

**解決**:
1. 確認已安裝 element-plus:
   ```bash
   npm install element-plus
   ```
2. 在 `main.ts` 中引入:
   ```typescript
   import ElementPlus from 'element-plus'
   import 'element-plus/dist/index.css'

   app.use(ElementPlus)
   ```

---

## 🔐 安全建議

1. **Token 管理**
   - 不要在程式碼中硬編碼 token
   - 使用 localStorage 或 sessionStorage
   - 登出時清除 token

2. **路由守衛**
   - 使用 `meta.requiresAuth` 標記需要登入的頁面
   - 在路由守衛中檢查 token

3. **敏感資訊**
   - 不要在前端儲存敏感資訊
   - API 金鑰等應放在後端

---

## 📚 參考資源

- [Vue 3 官方文件](https://vuejs.org/)
- [Vue Router 官方文件](https://router.vuejs.org/)
- [Pinia 官方文件](https://pinia.vuejs.org/)
- [Element Plus 官方文件](https://element-plus.org/)
- [Axios 官方文件](https://axios-http.com/)

---

祝你開發順利！🚀
