# 會計管理系統 - 前後端環境使用指南

## 📋 目錄
1. [專案架構](#專案架構)
2. [環境準備](#環境準備)
3. [後端設定 (NestJS)](#後端設定-nestjs)
4. [前端設定 (Vue)](#前端設定-vue)
5. [資料庫設定 (MySQL)](#資料庫設定-mysql)
6. [啟動專案](#啟動專案)
7. [常見問題](#常見問題)

---

## 📁 專案架構

```
Accounting-Management-System/
├── back_end/
│   └── accounting-backend/          # NestJS 後端專案
│       ├── src/
│       │   ├── main.ts             # 應用程式入口
│       │   ├── app.module.ts       # 根模組
│       │   └── ...                 # 其他模組
│       ├── .env                    # 環境變數設定
│       └── package.json
├── front_end/
│   └── accounting-frontend/         # Vue 前端專案
│       ├── src/
│       │   ├── main.ts             # 應用程式入口
│       │   ├── utils/
│       │   │   └── axios.ts        # API 請求設定
│       │   └── ...                 # 其他元件
│       ├── .env                    # 環境變數設定
│       └── package.json
└── SETUP_GUIDE.md                   # 本文件
```

---

## 🔧 環境準備

### 必要工具
- **Node.js** (v20+)
- **npm** (v10+)
- **MySQL** (v8.0+)
- **VS Code** (推薦)

### 檢查工具版本
```bash
node --version    # 應該顯示 v20.x.x 或更高
npm --version     # 應該顯示 10.x.x 或更高
mysql --version   # 應該顯示 8.0.x 或更高
```

---

## 🔙 後端設定 (NestJS)

### Step 1: 設定環境變數

編輯 `back_end/accounting-backend/.env` 檔案：

```env
# Database - 注意這裡使用 port 3306 避免與其他專案衝突
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_mysql_password    # 替換成你的 MySQL 密碼
DB_DATABASE=accounting_system

# JWT
JWT_SECRET=your_super_secret_key_here    # 替換成你的密鑰
JWT_EXPIRES_IN=7d

# App - 後端運行在 port 3001
PORT=3001
```

**重要提醒**：
- `DB_PORT=3306` 是為了避免與其他專案的 MySQL port (3306) 衝突
- 請將 `DB_PASSWORD` 改成你實際的 MySQL 密碼
- `JWT_SECRET` 建議使用隨機生成的長字串

### Step 2: 安裝後端依賴

```bash
cd back_end/accounting-backend
npm install
```

### Step 3: 測試後端是否正常運行

```bash
# 啟動開發伺服器
npm run start:dev
```

**成功訊息**：
```
[Nest] Starting Nest application...
[Nest] TypeOrmModule dependencies initialized
[Nest] Nest application successfully started
Application is running on: http://localhost:3001
```

**測試 API 回應**：
```bash
# 開啟另一個終端機視窗
curl http://localhost:3001
```

看到 404 錯誤是**正常的**，表示伺服器正常運行。

### 後端常用指令

```bash
# 開發模式 (自動重新載入)
npm run start:dev

# 正式環境建置
npm run build

# 正式環境啟動
npm run start:prod

# 執行測試
npm run test

# 程式碼格式化
npm run format

# 程式碼檢查
npm run lint
```

---

## 🎨 前端設定 (Vue)

### Step 1: 設定環境變數

編輯 `front_end/accounting-frontend/.env` 檔案：

```env
VITE_API_BASE_URL=http://localhost:3001
```

### Step 2: 安裝前端依賴

```bash
cd front_end/accounting-frontend
npm install
```

### Step 3: 測試前端是否正常運行

```bash
# 啟動開發伺服器
npm run dev
```

**成功訊息**：
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
➜  press h + enter to show help
```

開啟瀏覽器訪問 `http://localhost:5173/`，應該可以看到 Vue 預設頁面。

### 前端常用指令

```bash
# 開發模式
npm run dev

# 正式環境建置
npm run build

# 預覽建置結果
npm run preview

# 型別檢查
npm run type-check

# 程式碼檢查
npm run lint

# 程式碼格式化
npm run format
```

---

## 🗄️ 資料庫設定 (MySQL)

### Step 1: 啟動 MySQL (port 3306)

**方法 1：使用 Docker (推薦)**
```bash
docker run --name accounting-mysql \
  -e MYSQL_ROOT_PASSWORD=your_password \
  -e MYSQL_DATABASE=accounting_system \
  -p 3306:3306 \
  -d mysql:8.0
```

**方法 2：使用現有的 MySQL 服務**

如果你已經有 MySQL 安裝，需要設定它監聽 port 3306：

編輯 MySQL 設定檔 `my.cnf` 或 `my.ini`：
```ini
[mysqld]
port=3306
```

重新啟動 MySQL 服務。

### Step 2: 建立資料庫

**使用 MySQL 指令**：
```bash
# 連接到 MySQL (注意 port 3306)
mysql -u root -p -P 3306

# 建立資料庫
CREATE DATABASE accounting_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 確認建立成功
SHOW DATABASES;

# 離開
EXIT;
```

**使用 MySQL Workbench**：
1. 建立新連線，設定 port 為 `3306`
2. 連接到 MySQL 伺服器
3. 執行以下指令：
   ```sql
   CREATE DATABASE accounting_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

### Step 3: 驗證資料庫連線

確保後端已啟動，然後檢查後端 log 是否有成功連接資料庫的訊息。

---

## 🚀 啟動專案

### 完整啟動流程

1. **啟動 MySQL** (port 3306)
2. **啟動後端** (port 3001)
   ```bash
   cd back_end/accounting-backend
   npm run start:dev
   ```
3. **啟動前端** (port 5173)
   ```bash
   # 開啟新的終端機視窗
   cd front_end/accounting-frontend
   npm run dev
   ```

### 檢查所有服務是否正常運行

| 服務 | Port | URL | 檢查方法 |
|-----|------|-----|---------|
| MySQL | 3306 | - | `mysql -u root -p -P 3306` |
| 後端 (NestJS) | 3001 | http://localhost:3001 | `curl http://localhost:3001` |
| 前端 (Vue) | 5173 | http://localhost:5173 | 開啟瀏覽器 |

---

## ❓ 常見問題

### Q1: MySQL port 3306 連線失敗

**錯誤訊息**：
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```

**解決方法**：
1. 確認 MySQL 是否在 port 3306 運行：
   ```bash
   netstat -ano | findstr :3306
   ```
2. 如果沒有，檢查 MySQL 設定檔或使用 Docker 啟動

### Q2: 後端啟動失敗 - Unknown database

**錯誤訊息**：
```
Error: Unknown database 'accounting_system'
```

**解決方法**：
```bash
mysql -u root -p -P 3306
CREATE DATABASE accounting_system;
```

### Q3: 前端無法連接後端 API

**錯誤訊息**：
```
Network Error / CORS error
```

**解決方法**：
1. 確認後端已啟動 (`http://localhost:3001`)
2. 檢查 `front_end/accounting-frontend/.env` 中的 `VITE_API_BASE_URL`
3. 確認後端 `main.ts` 中已啟用 CORS

### Q4: Port 3001 已被佔用

**錯誤訊息**：
```
EADDRINUSE: address already in use :::3001
```

**解決方法**：
```bash
# 查看佔用 port 的程序
netstat -ano | findstr :3001

# 強制停止該程序 (替換 PID)
taskkill /PID <PID> /F

# 或修改 .env 中的 PORT
```

### Q5: 如何停止所有服務？

**停止後端**：
- 在運行 `npm run start:dev` 的終端機按 `Ctrl + C`

**停止前端**：
- 在運行 `npm run dev` 的終端機按 `Ctrl + C`

**停止 MySQL (Docker)**：
```bash
docker stop accounting-mysql
```

---

## 📦 安裝的套件說明

### 後端 (NestJS)

| 套件 | 用途 |
|-----|------|
| `@nestjs/typeorm` | TypeORM 整合 |
| `typeorm` | ORM 框架 |
| `mysql2` | MySQL 驅動 |
| `@nestjs/config` | 環境變數管理 |
| `@nestjs/jwt` | JWT 認證 |
| `@nestjs/passport` | 身份驗證 |
| `passport-jwt` | JWT 策略 |
| `bcrypt` | 密碼加密 |
| `class-validator` | 資料驗證 |
| `class-transformer` | 資料轉換 |

### 前端 (Vue)

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

## 🔐 安全建議

1. **不要將 `.env` 檔案提交到 Git**
   - 已加入 `.gitignore`

2. **正式環境記得修改**：
   - `JWT_SECRET` 使用強密碼
   - `synchronize: false` (使用 migration)
   - 資料庫密碼使用環境變數

3. **CORS 設定**：
   - 正式環境要限制允許的來源網域

---

## 📚 參考資源

- [NestJS 官方文件](https://docs.nestjs.com/)
- [Vue 3 官方文件](https://vuejs.org/)
- [TypeORM 文件](https://typeorm.io/)
- [Element Plus 文件](https://element-plus.org/)

---

## 🎯 下一步

1. 建立資料庫 Entity (例如：User, Account, Transaction 等)
2. 實作 CRUD API
3. 建立前端頁面和元件
4. 實作使用者認證功能
5. 整合前後端測試

祝你開發順利！🎉
