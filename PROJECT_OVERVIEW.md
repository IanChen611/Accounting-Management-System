# 專案概覽 - 會計管理系統

## 📊 專案資訊

- **專案名稱**: 會計管理系統 (Accounting Management System)
- **技術架構**: Vue 3 + NestJS + MySQL
- **開發狀態**: 初始化完成 ✅

---

## 🎯 已完成的設定

### ✅ 後端 (NestJS)
- [x] NestJS 專案建立
- [x] TypeORM + MySQL 整合
- [x] JWT 認證套件安裝
- [x] 環境變數設定 (.env)
- [x] CORS 設定
- [x] 全域驗證管道
- [x] Migration 支援
- [x] Port 設定為 3001
- [x] MySQL Port 設定為 3306

### ✅ 前端 (Vue)
- [x] Vue 3 + TypeScript 專案建立
- [x] Vue Router 路由設定
- [x] Pinia 狀態管理
- [x] Axios HTTP 請求設定
- [x] Element Plus UI 套件
- [x] 環境變數設定 (.env)
- [x] API 攔截器設定 (自動加入 JWT token)

### ✅ 文件
- [x] README.md - 快速開始指南
- [x] SETUP_GUIDE.md - 詳細設定文件
- [x] PROJECT_OVERVIEW.md - 本文件

---

## 📁 專案結構

```
Accounting-Management-System/
├── back_end/
│   └── accounting-backend/
│       ├── src/
│       │   ├── main.ts                 # 應用程式入口 (已設定 CORS + 驗證)
│       │   ├── app.module.ts           # 根模組 (已整合 TypeORM)
│       │   ├── data-source.ts          # TypeORM Migration 設定
│       │   └── migrations/             # Migration 檔案資料夾
│       ├── test-connection.js          # MySQL 連線測試腳本
│       ├── .env                        # 環境變數 (port 3306)
│       ├── .gitignore                  # Git 忽略檔案
│       └── package.json                # 後端依賴 (已加入 migration 指令)
│
├── front_end/
│   └── accounting-frontend/
│       ├── src/
│       │   ├── main.ts                 # 應用程式入口
│       │   ├── utils/
│       │   │   └── axios.ts            # Axios 設定 (已設定攔截器)
│       │   └── services/
│       │       └── api.ts              # API 服務範例
│       ├── .env                        # 環境變數
│       └── package.json                # 前端依賴
│
├── README.md                            # 快速開始指南
├── SETUP_GUIDE.md                       # 詳細設定文件
└── PROJECT_OVERVIEW.md                  # 本文件
```

---

## 🔧 環境配置

### Port 分配

| 服務 | Port | 說明 |
|-----|------|------|
| **MySQL** | **3306** | 避免與其他專案衝突 (預設是 3306) |
| **NestJS 後端** | **3001** | REST API 服務 |
| **Vue 前端** | **5173** | Vite 開發伺服器 |

### 環境變數

**後端 (.env)**:
```env
DB_HOST=localhost
DB_PORT=3306              # ← 注意是 3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=accounting_system
JWT_SECRET=your_secret_key
PORT=3001
```

**前端 (.env)**:
```env
VITE_API_BASE_URL=http://localhost:3001
```

---

## 🚀 快速啟動指令

### 1. 啟動 MySQL (Port 3306)

**使用 Docker**:
```bash
docker run --name accounting-mysql \
  -e MYSQL_ROOT_PASSWORD=your_password \
  -e MYSQL_DATABASE=accounting_system \
  -p 3306:3306 \
  -d mysql:8.0
```

**手動建立資料庫**:
```bash
mysql -u root -p -P 3306
CREATE DATABASE accounting_system;
```

### 2. 啟動後端

```bash
cd back_end/accounting-backend
npm install                    # 第一次需要
npm run start:dev              # 啟動開發伺服器
```

**測試後端連線**:
```bash
node test-connection.js        # 測試 MySQL 連線
curl http://localhost:3001     # 測試 API (應該回傳 404)
```

### 3. 啟動前端

```bash
cd front_end/accounting-frontend
npm install                    # 第一次需要
npm run dev                    # 啟動開發伺服器
```

開啟瀏覽器: `http://localhost:5173/`

---

## 📦 已安裝的套件

### 後端套件

| 套件 | 版本 | 用途 |
|-----|------|------|
| `@nestjs/typeorm` | ^11.0.0 | TypeORM 整合 |
| `typeorm` | ^0.3.28 | ORM 框架 |
| `mysql2` | ^3.16.0 | MySQL 驅動 |
| `@nestjs/config` | ^4.0.2 | 環境變數管理 |
| `@nestjs/jwt` | ^11.0.2 | JWT 認證 |
| `@nestjs/passport` | ^11.0.5 | 身份驗證 |
| `passport-jwt` | ^4.0.1 | JWT 策略 |
| `bcrypt` | ^6.0.0 | 密碼加密 |
| `class-validator` | ^0.14.3 | 資料驗證 |
| `class-transformer` | ^0.5.1 | 資料轉換 |

### 前端套件

| 套件 | 用途 |
|-----|------|
| `vue` | Vue 3 框架 |
| `vue-router` | 路由管理 |
| `pinia` | 狀態管理 |
| `axios` | HTTP 請求 |
| `element-plus` | UI 元件庫 |
| `@element-plus/icons-vue` | Element Plus 圖示 |
| `typescript` | TypeScript 支援 |

---

## 🔑 重要檔案說明

### 後端核心檔案

1. **[src/main.ts](./back_end/accounting-backend/src/main.ts)**
   - 應用程式入口
   - 已設定 CORS (允許前端 localhost:5173)
   - 已啟用全域驗證

2. **[src/app.module.ts](./back_end/accounting-backend/src/app.module.ts)**
   - 根模組
   - 已整合 TypeORM
   - MySQL port 設定為 3306

3. **[src/data-source.ts](./back_end/accounting-backend/src/data-source.ts)**
   - TypeORM Migration 設定
   - 用於資料庫版本管理

4. **[.env](./back_end/accounting-backend/.env)**
   - 環境變數 (包含資料庫密碼、JWT 密鑰)
   - ⚠️ 已加入 .gitignore,不會提交到 Git

### 前端核心檔案

1. **[src/utils/axios.ts](./front_end/accounting-frontend/src/utils/axios.ts)**
   - Axios 設定
   - 請求攔截器:自動加入 JWT token
   - 回應攔截器:401 自動導向登入頁

2. **[src/services/api.ts](./front_end/accounting-frontend/src/services/api.ts)**
   - API 服務範例
   - 包含使用者和認證 API

3. **[.env](./front_end/accounting-frontend/.env)**
   - 前端環境變數
   - API base URL 設定

---

## ✅ 檢查清單

### 第一次使用前的準備

- [ ] 已安裝 Node.js (v20+)
- [ ] 已安裝 MySQL (或使用 Docker)
- [ ] MySQL 在 port 3306 運行
- [ ] 已建立資料庫 `accounting_system`
- [ ] 後端 .env 設定完成 (特別是 DB_PASSWORD)
- [ ] 前端 .env 設定完成
- [ ] 後端依賴安裝完成 (`npm install`)
- [ ] 前端依賴安裝完成 (`npm install`)

### 啟動檢查

- [ ] MySQL 服務正常運行 (port 3306)
- [ ] 後端啟動成功 (`npm run start:dev`)
- [ ] 前端啟動成功 (`npm run dev`)
- [ ] 訪問 `http://localhost:5173/` 能看到頁面
- [ ] `curl http://localhost:3001` 有回應

---

## 🎯 下一步開發建議

### 1. 建立資料庫 Entity
```bash
cd back_end/accounting-backend

# 建立資料夾
mkdir -p src/users/entities

# 建立 Entity 檔案
# 例如: User, Account, Transaction 等
```

### 2. 生成模組
```bash
# 使用 NestJS CLI
nest g module users
nest g controller users
nest g service users
```

### 3. 建立 Migration
```bash
# 生成 migration
npm run migration:generate -- src/migrations/CreateUserTable

# 執行 migration
npm run migration:run
```

### 4. 建立前端頁面
```bash
cd front_end/accounting-frontend

# 建立元件
# 例如: LoginView, DashboardView 等
```

---

## 🔐 安全注意事項

1. **.env 檔案不要提交到 Git**
   - 已加入 .gitignore
   - 包含敏感資訊 (資料庫密碼、JWT 密鑰)

2. **JWT_SECRET 要使用強密碼**
   - 建議使用隨機生成的長字串
   - 可以用 `openssl rand -base64 32` 生成

3. **正式環境設定**
   - `synchronize: false` (使用 migration)
   - CORS 限制允許的來源網域
   - 資料庫密碼使用環境變數

---

## 📚 相關文件連結

- [NestJS 官方文件](https://docs.nestjs.com/)
- [Vue 3 官方文件](https://vuejs.org/)
- [TypeORM 官方文件](https://typeorm.io/)
- [Element Plus 官方文件](https://element-plus.org/)
- [Pinia 官方文件](https://pinia.vuejs.org/)

---

## 🆘 常見問題

詳細的問題排除請參考 [SETUP_GUIDE.md](./SETUP_GUIDE.md) 的「常見問題」章節。

常見錯誤:
- MySQL 連線失敗 → 檢查 port 3306 是否開啟
- Unknown database → 手動建立資料庫
- CORS error → 檢查後端 CORS 設定
- Port 被佔用 → 使用 `netstat` 查看並結束程序

---

## 📝 更新日誌

### 2025-12-27
- ✅ 初始化 NestJS 後端專案
- ✅ 初始化 Vue 3 前端專案
- ✅ 設定 MySQL 連線 (port 3306)
- ✅ 設定 CORS 和全域驗證
- ✅ 建立環境變數檔案
- ✅ 建立專案文件

---

祝你開發順利！🚀
