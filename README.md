# 會計管理系統 (Accounting Management System)

一個使用 Vue 3 + NestJS + MySQL 建構的現代化會計管理系統。

## 🚀 快速開始

### 1. 啟動 MySQL (Port 3306)

**使用 Docker (推薦)**：
```bash
docker run --name accounting-mysql \
  -e MYSQL_ROOT_PASSWORD=your_password \
  -e MYSQL_DATABASE=accounting_system \
  -p 3306:3306 \
  -d mysql:8.0
```

**或手動建立資料庫**：
```bash
mysql -u root -p -P 3306
CREATE DATABASE accounting_system;
```

### 2. 啟動後端 (Port 3001)

```bash
cd back_end/accounting-backend

# 第一次使用需要安裝依賴
npm install

# 設定 .env 檔案 (將 your_mysql_password 改成你的密碼)
# DB_PORT=3306
# DB_PASSWORD=your_mysql_password

# 啟動開發伺服器
npm run start:dev
```

### 3. 啟動前端 (Port 5173)

```bash
cd front_end/accounting-frontend

# 第一次使用需要安裝依賴
npm install

# 啟動開發伺服器
npm run dev
```

### 4. 開啟瀏覽器

訪問 `http://localhost:5173/`

---

## 📖 詳細文件

完整的設定與使用說明請參考 [SETUP_GUIDE.md](./SETUP_GUIDE.md)

---

## 🛠️ 技術棧

- **前端**: Vue 3 + TypeScript + Pinia + Vue Router + Element Plus
- **後端**: NestJS + TypeORM + JWT
- **資料庫**: MySQL 8.0
- **開發工具**: Vite, ESLint, Prettier

---

## 📂 專案結構

```
Accounting-Management-System/
├── back_end/
│   └── accounting-backend/     # NestJS 後端 (port 3001)
├── front_end/
│   └── accounting-frontend/    # Vue 前端 (port 5173)
├── SETUP_GUIDE.md             # 詳細設定指南
└── README.md                  # 本文件
```

---

## ⚙️ Port 配置

| 服務 | Port | 說明 |
|-----|------|------|
| MySQL | 3306 | 避免與其他專案的 MySQL (3306) 衝突 |
| 後端 API | 3001 | NestJS 後端服務 |
| 前端 | 5173 | Vite 開發伺服器 |

---

## 🔑 環境變數

### 後端 (.env)
```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=accounting_system
JWT_SECRET=your_secret_key
PORT=3001
```

### 前端 (.env)
```env
VITE_API_BASE_URL=http://localhost:3001
```

---

## 📝 License

MIT
