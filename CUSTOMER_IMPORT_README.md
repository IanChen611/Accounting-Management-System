# 客戶資料匯入指南

## 快速開始（在另一台電腦上設置系統）

### 1. 匯入客戶資料

客戶資料已從 `客代簡稱.xlsx` 自動生成 SQL 腳本。

**方式一：使用批次檔（推薦）**
```bash
# Windows
import-customers-data.bat
```
執行後會提示輸入 MySQL root 密碼，然後自動匯入 142 筆客戶資料。

**方式二：手動執行 SQL**
```bash
mysql -u root -p accounting_system < import-customers.sql
```

### 2. 驗證匯入結果

```bash
# 方式一：使用 MySQL 指令
mysql -u root -p -e "USE accounting_system; SELECT COUNT(*) FROM customers;"

# 方式二：使用 API（需先啟動後端）
curl "http://localhost:3001/customers"
```

應該會看到 142 筆客戶資料。

## 檔案說明

- **`客代簡稱.xlsx`** - 原始客戶資料 Excel 檔案
- **`generate-customer-sql.js`** - 讀取 Excel 並生成 SQL 的 Node.js 腳本
- **`import-customers.sql`** - 自動生成的 SQL 匯入腳本（142 筆客戶）
- **`import-customers-data.bat`** - Windows 批次檔，執行 SQL 匯入

## 重新生成 SQL（如果 Excel 有更新）

```bash
# 1. 確保已安裝 xlsx 套件
npm install xlsx

# 2. 執行生成腳本
node generate-customer-sql.js

# 3. 執行匯入
import-customers-data.bat
```

## 客戶資料結構

每筆客戶包含以下欄位：
- **code** - 客戶代號（例如：001, 002, 003-1）
- **name** - 客戶簡稱（例如：亞麗、瀅州）
- **zipCode** - 郵遞區號（例如：407, 717）
- **address** - 發票地址
- **phone** - 聯絡電話（目前為 NULL，可手動更新）

## 注意事項

1. **ON DUPLICATE KEY UPDATE**：如果客戶代號已存在，會更新該客戶的資料
2. **清空資料**：如需完全重新匯入，請取消 SQL 腳本中 `TRUNCATE TABLE customers;` 的註解
3. **資料庫名稱**：確保使用 `accounting_system` 而非 `accounting_db`

## 完整系統設置流程

在新電腦上設置系統：

```bash
# 1. Clone 專案
git clone <repository-url>
cd Accounting-Management-System

# 2. 安裝後端依賴
cd back_end/accounting-backend
npm install

# 3. 設置環境變數
# 複製 .env.example 為 .env（如果有的話）
# 或手動建立 .env 檔案，設定資料庫連線

# 4. 建立資料庫
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS accounting_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 5. 更新資料庫 Schema
cd ../..
update-database-schema.bat

# 6. 匯入客戶資料
import-customers-data.bat

# 7. 啟動後端
cd back_end/accounting-backend
npm run start:dev

# 8. 啟動前端（另開終端機）
cd front_end/accounting-frontend
npm install
npm run dev
```

## 完成！

客戶資料已成功匯入，系統可以開始使用了！🎉
