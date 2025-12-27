# 資料庫 Schema 更新指南

由於我們修改了 Entity 定義，需要更新資料庫 schema。

## 新增的欄位

1. **invoices 表**：新增 `isVoided` 欄位（作廢標記）
2. **customers 表**：新增 `zipCode` 欄位（郵遞區號）

## 更新方式

### 方式一：讓 TypeORM 自動同步（推薦）

由於 `app.module.ts` 中已設定 `synchronize: true`，只需要：

1. **重啟後端伺服器**
   - 停止當前運行的後端（如果正在運行）
   - 重新啟動：`cd back_end/accounting-backend && npm run start:dev`

2. TypeORM 會自動檢測 Entity 變更並更新資料庫 schema

3. **驗證更新**
   ```bash
   # 檢查後端是否正常啟動
   curl http://localhost:3001/customers
   ```

### 方式二：手動執行 SQL

如果自動同步失敗，請手動執行以下 SQL：

**注意**：資料庫名稱為 `accounting_system`（不是 `accounting_db`）

使用提供的 SQL 腳本：
```bash
# Windows
update-database-schema.bat

# 或直接使用 mysql
mysql -u root -p accounting_system < update-schema.sql
```

SQL 腳本會自動檢查欄位是否存在，避免重複新增的錯誤。

### 執行 SQL 的方式

#### 使用 MySQL Workbench
1. 開啟 MySQL Workbench
2. 連接到資料庫（localhost, user: root）
3. 選擇 `accounting_db` 資料庫
4. 複製上面的 SQL 並執行

#### 使用命令列
```bash
# Windows - 使用批次檔（會提示輸入密碼）
update-database-schema.bat

# 或使用完整路徑
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p accounting_system < update-schema.sql
```

## 更新後的步驟

Schema 更新完成後，執行以下步驟：

### 1. 重新匯入客戶資料（含郵遞區號）

```bash
cd D:\Code\Accounting-Management-System
node reimport-customers-with-zipcode.js
```

這會：
- 刪除所有現有客戶
- 從 `客代簡稱.xlsx` 重新匯入 142 筆客戶資料
- 包含郵遞區號欄位

### 2. 驗證匯入結果

```bash
# 檢查客戶總數
curl "http://localhost:3001/customers?page=1&limit=1"

# 檢查特定客戶（應該包含 zipCode）
curl "http://localhost:3001/customers?search=001"
```

## 疑難排解

### 後端無法啟動

檢查錯誤訊息：
```bash
cd back_end/accounting-backend
npm run start:dev
# 查看控制台輸出的錯誤訊息
```

常見問題：
- 資料庫連線失敗：檢查 MySQL 是否運行
- 端口被佔用：檢查 3001 端口是否被其他程式使用
- TypeScript 編譯錯誤：檢查語法錯誤

### 欄位已存在錯誤

如果看到 "Duplicate column name" 錯誤，表示欄位已經存在，可以忽略。

### 確認 schema 更新成功

```sql
-- 查看 invoices 表結構
DESCRIBE invoices;
-- 應該看到 isVoided 欄位

-- 查看 customers 表結構
DESCRIBE customers;
-- 應該看到 zipCode 欄位
```

## 完成！

Schema 更新完成後，系統將支援：
- ✅ 發票編碼驗證（兩個英文字母 + 八位數字）
- ✅ 作廢發票功能
- ✅ 客戶郵遞區號
- ✅ Excel 匯出排序（按字母、日期、編號）
- ✅ Excel 匯出標記作廢發票
