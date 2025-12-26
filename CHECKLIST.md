# 專案設定檢查清單

使用此檢查清單確保所有設定都正確完成。

---

## ✅ 環境準備

- [ ] 已安裝 Node.js v20 或以上版本
  ```bash
  node --version  # 應該顯示 v20.x.x 或更高
  ```

- [ ] 已安裝 npm v10 或以上版本
  ```bash
  npm --version   # 應該顯示 10.x.x 或更高
  ```

- [ ] 已安裝 MySQL 8.0 或以上版本
  ```bash
  mysql --version # 應該顯示 8.0.x 或更高
  ```

---

## 🗄️ 資料庫設定

- [ ] MySQL 服務正常運行 (port 3306)
  ```bash
  netstat -ano | findstr :3306
  ```

- [ ] 已建立資料庫 `accounting_system`
  ```bash
  mysql -u root -p -P 3306
  CREATE DATABASE accounting_system;
  SHOW DATABASES;  # 確認有看到 accounting_system
  ```

- [ ] 能夠成功連接到資料庫
  ```bash
  mysql -u root -p -P 3306 accounting_system
  # 應該能成功進入資料庫
  ```

---

## 🔙 後端設定

- [ ] 已進入後端目錄
  ```bash
  cd back_end/accounting-backend
  ```

- [ ] 已安裝後端依賴
  ```bash
  npm install
  # 應該看到成功安裝的訊息
  ```

- [ ] 已設定 `.env` 檔案
  - [ ] `DB_HOST=localhost`
  - [ ] `DB_PORT=3306`
  - [ ] `DB_USERNAME=root`
  - [ ] `DB_PASSWORD=你的MySQL密碼` ⚠️ **必須修改**
  - [ ] `DB_DATABASE=accounting_system`
  - [ ] `JWT_SECRET=你的密鑰` ⚠️ **建議修改**
  - [ ] `PORT=3001`

- [ ] MySQL 連線測試成功
  ```bash
  node test-connection.js
  # 應該看到 "✅ MySQL 連線成功!"
  ```

- [ ] 後端開發伺服器啟動成功
  ```bash
  npm run start:dev
  # 應該看到 "Nest application successfully started"
  # 應該看到 "Application is running on: http://localhost:3001"
  ```

- [ ] 後端 API 正常回應
  ```bash
  # 開啟新的終端機視窗測試
  curl http://localhost:3001
  # 看到 404 錯誤是正常的,表示伺服器正在運行
  ```

---

## 🎨 前端設定

- [ ] 已進入前端目錄
  ```bash
  cd front_end/accounting-frontend
  ```

- [ ] 已安裝前端依賴
  ```bash
  npm install
  # 應該看到成功安裝的訊息
  ```

- [ ] 已設定 `.env` 檔案
  - [ ] `VITE_API_BASE_URL=http://localhost:3001`

- [ ] 前端開發伺服器啟動成功
  ```bash
  npm run dev
  # 應該看到 "Local: http://localhost:5173/"
  ```

- [ ] 瀏覽器能正常開啟前端頁面
  ```
  開啟瀏覽器訪問: http://localhost:5173/
  應該能看到 Vue 預設頁面
  ```

---

## 🚀 完整運行檢查

- [ ] MySQL 正常運行 (port 3306)
- [ ] 後端正常運行 (port 3001)
- [ ] 前端正常運行 (port 5173)
- [ ] 三個服務同時運行沒有問題

### Port 檢查

執行以下指令確認所有 port 都已啟動:

```bash
# Windows
netstat -ano | findstr "3306 3001 5173"

# 應該看到三個 port 都在 LISTENING 狀態
```

---

## 📁 檔案結構檢查

- [ ] 確認以下檔案都存在:

### 後端檔案
```
back_end/accounting-backend/
├── .env                              ✓
├── .gitignore                        ✓
├── package.json                      ✓
├── test-connection.js                ✓
├── src/
│   ├── main.ts                       ✓
│   ├── app.module.ts                 ✓
│   ├── data-source.ts                ✓
│   └── migrations/                   ✓
```

### 前端檔案
```
front_end/accounting-frontend/
├── .env                              ✓
├── package.json                      ✓
├── src/
│   ├── main.ts                       ✓
│   ├── utils/
│   │   └── axios.ts                  ✓
│   └── services/
│       └── api.ts                    ✓
```

### 文件檔案
```
Accounting-Management-System/
├── README.md                         ✓
├── SETUP_GUIDE.md                    ✓
├── PROJECT_OVERVIEW.md               ✓
├── CHECKLIST.md                      ✓ (本文件)
├── back_end/
│   └── BACKEND_SETUP_GUIDE.md        ✓
└── front_end/
    └── FRONTEND_SETUP_GUIDE.md       ✓
```

---

## 🧪 功能測試

### 後端測試

- [ ] 測試後端 API 回應
  ```bash
  curl http://localhost:3001
  # 應該回傳 404 (正常)
  ```

### 前端測試

- [ ] 開啟瀏覽器開發者工具 (F12)
- [ ] 檢查 Console 沒有錯誤訊息
- [ ] 檢查 Network 沒有紅色的失敗請求

---

## 🔐 安全檢查

- [ ] `.env` 檔案已加入 `.gitignore`
- [ ] 確認 `.env` 不會被提交到 Git
  ```bash
  git status
  # .env 不應該出現在未追蹤檔案中
  ```

- [ ] `DB_PASSWORD` 已修改為實際的 MySQL 密碼
- [ ] `JWT_SECRET` 已修改為強密碼 (建議 32 字元以上)

---

## 📚 文件閱讀

建議按照以下順序閱讀文件:

1. [ ] [README.md](./README.md) - 快速開始
2. [ ] [SETUP_GUIDE.md](./SETUP_GUIDE.md) - 詳細設定指南
3. [ ] [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md) - 專案概覽
4. [ ] [back_end/BACKEND_SETUP_GUIDE.md](./back_end/BACKEND_SETUP_GUIDE.md) - 後端詳細指南
5. [ ] [front_end/FRONTEND_SETUP_GUIDE.md](./front_end/FRONTEND_SETUP_GUIDE.md) - 前端詳細指南

---

## ⚠️ 常見問題快速排除

### MySQL 連線失敗
```bash
# 1. 檢查 MySQL 是否運行
netstat -ano | findstr :3306

# 2. 測試連線
node back_end/accounting-backend/test-connection.js
```

### 後端啟動失敗
```bash
# 1. 檢查依賴是否安裝
cd back_end/accounting-backend
npm install

# 2. 檢查 .env 設定
cat .env  # Linux/Mac
type .env # Windows
```

### 前端啟動失敗
```bash
# 1. 檢查依賴是否安裝
cd front_end/accounting-frontend
npm install

# 2. 清除快取重新啟動
npm run dev
```

### Port 被佔用
```bash
# Windows - 找出佔用 port 的程序
netstat -ano | findstr :[PORT]
taskkill /PID [PID] /F
```

---

## 🎯 完成確認

當以上所有項目都打勾後,你的開發環境就設定完成了!

下一步可以:
1. 建立資料庫 Entity
2. 實作 CRUD API
3. 建立前端頁面
4. 整合前後端測試

---

## 💡 小提示

- 每次啟動專案時,確保三個服務都正常運行 (MySQL, 後端, 前端)
- 修改 `.env` 後需要重新啟動服務
- 使用 Git 時記得不要提交 `.env` 檔案
- 定期檢查並更新套件版本

---

祝你開發順利！🚀

**如有任何問題,請參考 [SETUP_GUIDE.md](./SETUP_GUIDE.md) 的常見問題章節。**
