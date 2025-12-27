## todoList

1. ✅ 發票的編碼需要是「兩個英文字母」配上「八位數字」，且不能重複。
2. ✅ 需要新增一個「作廢發票」，輸出成excel的時候，直接在日期那欄標記「作廢」，並且作廢發票不需要填寫金額、客戶等欄位，但還是要有發票編號。
3. ✅ 客戶的部分需要新增一個欄位「郵遞區號」，你可以用舊有資料 @客代簡稱.xlsx 匯入資料庫內。
4. ✅ 輸出發票資料的時候，請先照發票英文字母的部分分組，再依照日期排序，再照發票編號標示

---

## 完成說明

### 1. 發票編碼驗證 ✅
- **後端**: [create-invoice.dto.ts:23-27](d:\Code\Accounting-Management-System\back_end\accounting-backend\src\invoices\dto\create-invoice.dto.ts#L23-L27) 新增正則表達式驗證 `/^[A-Z]{2}\d{8}$/`
- **前端**: [InvoiceForm.vue:220-227](d:\Code\Accounting-Management-System\front_end\accounting-frontend\src\components\InvoiceForm.vue#L220-L227) 新增格式驗證和提示訊息
- **測試結果**: ✅ 錯誤格式會回傳 400 錯誤，正確格式可成功建立

### 2. 作廢發票功能 ✅
- **後端**:
  - [invoice.entity.ts:48](d:\Code\Accounting-Management-System\back_end\accounting-backend\src\invoices\entities\invoice.entity.ts#L48) 新增 `isVoided` 欄位
  - [invoices.service.ts:58-80](d:\Code\Accounting-Management-System\back_end\accounting-backend\src\invoices\invoices.service.ts#L58-L80) 處理作廢發票邏輯
  - [excel.service.ts:88-97](d:\Code\Accounting-Management-System\back_end\accounting-backend\src\invoices\excel.service.ts#L88-L97) Excel 匯出時標記「作廢」
- **前端**:
  - [InvoiceForm.vue:25-28](d:\Code\Accounting-Management-System\front_end\accounting-frontend\src\components\InvoiceForm.vue#L25-L28) 新增作廢開關
  - [InvoiceForm.vue:276-296](d:\Code\Accounting-Management-System\front_end\accounting-frontend\src\components\InvoiceForm.vue#L276-L296) 切換作廢時自動清空/隱藏不必要欄位
  - [InvoiceListView.vue:49-61](d:\Code\Accounting-Management-System\front_end\accounting-frontend\src\views\InvoiceListView.vue#L49-L61) 列表顯示作廢狀態
- **測試結果**: ✅ 成功建立作廢發票 (ZZ00000001)，Excel 匯出正確顯示「作廢」

### 3. 客戶郵遞區號 ✅
- **後端**: [customer.entity.ts:20-21](d:\Code\Accounting-Management-System\back_end\accounting-backend\src\customers\entities\customer.entity.ts#L20-L21) 新增 `zipCode` 欄位
- **前端**:
  - [CustomerListView.vue:14](d:\Code\Accounting-Management-System\front_end\accounting-frontend\src\views\CustomerListView.vue#L14) 列表顯示郵遞區號
  - [CustomerListView.vue:39-41](d:\Code\Accounting-Management-System\front_end\accounting-frontend\src\views\CustomerListView.vue#L39-L41) 表單新增郵遞區號欄位
- **資料匯入**: ✅ 已執行 [reimport-customers-with-zipcode.js](d:\Code\Accounting-Management-System\reimport-customers-with-zipcode.js)，成功匯入 142 筆客戶資料（含郵遞區號）
- **測試結果**: ✅ API 正確回傳 zipCode 欄位

### 4. Excel 匯出排序 ✅
- **後端**: [invoices.service.ts:147-164](d:\Code\Accounting-Management-System\back_end\accounting-backend\src\invoices\invoices.service.ts#L147-L164) 實作三階段排序
  1. 發票號碼前兩個字母 (AA → AB → ZZ)
  2. 發票日期 (早 → 晚)
  3. 發票號碼完整比對
- **測試結果**: ✅ Excel 匯出正確排序 (AA11111111 → AB22222222 → AB12345678 → ZZ00000001)

---

## 資料庫 Schema 更新

已使用 TypeORM 自動同步功能更新資料庫：
- `invoices.isVoided` (TINYINT(1), DEFAULT 0)
- `customers.zipCode` (VARCHAR(10), NULLABLE)

相關文件：
- [SCHEMA_UPDATE_GUIDE.md](d:\Code\Accounting-Management-System\SCHEMA_UPDATE_GUIDE.md) - Schema 更新指南
- [update-schema.sql](d:\Code\Accounting-Management-System\update-schema.sql) - SQL 更新腳本
- [update-database-schema.bat](d:\Code\Accounting-Management-System\update-database-schema.bat) - Windows 批次執行檔

---

## 追加功能 (2025-12-27)

### 5. 負數金額支援 ✅
**用途**：支援「減預收貨款」等減項商品

**修改內容**：
- **後端**: [invoice-item.dto.ts:12-13](d:\Code\Accounting-Management-System\back_end\accounting-backend\src\invoices\dto\invoice-item.dto.ts#L12-L13) 移除金額最小值限制
- **前端**: [InvoiceForm.vue:127-134](d:\Code\Accounting-Management-System\front_end\accounting-frontend\src\components\InvoiceForm.vue#L127-L134) 移除 `:min="0"` 限制，新增提示「負數表示減項」
- **計算邏輯**: 後端使用 `reduce` 自動處理正負數加總

**測試結果**: ✅ 成功建立含負數商品的發票 (CC11111111)
- 水槽: +2000
- 減預收貨款: -500
- 未稅金額: 1500 ✅
- 稅金: 75 ✅
- 含稅金額: 1575 ✅

### 6. 發票列表合併儲存格顯示 ✅
**用途**：同一張發票的多個商品項目，其發票資訊（日期、號碼、狀態、買受人）和金額統計（未稅金額、稅金、含稅金額）使用合併儲存格顯示

**修改內容**：
- **前端**: [InvoiceListView.vue:45](d:\Code\Accounting-Management-System\front_end\accounting-frontend\src\views\InvoiceListView.vue#L45) 新增 `:span-method="objectSpanMethod"`
- **資料結構**: [InvoiceListView.vue:160-204](d:\Code\Accounting-Management-System\front_end\accounting-frontend\src\views\InvoiceListView.vue#L160-L204) 新增 `_rowspan` 和 `_itemIndex` 追蹤
- **合併邏輯**: [InvoiceListView.vue:134-161](d:\Code\Accounting-Management-System\front_end\accounting-frontend\src\views\InvoiceListView.vue#L134-L161) 實作 `objectSpanMethod`
- **新增欄位**: 新增「未稅金額」欄位，與稅金、含稅金額一起合併顯示

**合併欄位**（同一張發票只顯示一次）：
- 發票日期 (columnIndex: 0)
- 發票號碼 (columnIndex: 1)
- 狀態 (columnIndex: 2)
- 買受人 (columnIndex: 3)
- 未稅金額 (columnIndex: 8) ⭐
- 稅金 (columnIndex: 9) ⭐
- 含稅金額 (columnIndex: 10) ⭐
- 操作 (columnIndex: 11)

**不合併欄位**（每個商品分別顯示）：
- 品名 (columnIndex: 4)
- 數量 (columnIndex: 5)
- 單價 (columnIndex: 6)
- 金額 (columnIndex: 7) ⭐

**測試結果**: ✅ 列表正確顯示合併儲存格，每個商品的金額分別顯示，同一張發票的金額統計只顯示一次

---

## 問題修正 (2025-12-28)

### 7. 發票編輯功能修正 ✅
**問題描述**：編輯發票時，資料無法正確載入和更新

**根本原因**：
1. **DTO 驗證問題**：從 API 載入的發票資料包含 `id`、`invoiceId`、`unitPrice` 等欄位，但 `InvoiceItemDto` 只定義了必填的 `productName`、`quantity`、`amount`，導致驗證失敗
2. **資料類型問題**：從 API 回傳的 DECIMAL 類型欄位（`amount`、`quantity`）是字串格式，前端計算時未正確轉換

**修正內容**：
- **後端** [invoice-item.dto.ts:4-25](d:\Code\Accounting-Management-System\back_end\accounting-backend\src\invoices\dto\invoice-item.dto.ts#L4-L25)：新增可選欄位 `id`、`invoiceId`、`unitPrice`，允許編輯時接收這些欄位
- **前端** [InvoiceForm.vue:350-372](d:\Code\Accounting-Management-System\front_end\accounting-frontend\src\components\InvoiceForm.vue#L350-L372)：在 `onMounted` 中將 API 回傳的字串數字轉換為 Number 類型

**測試結果**：✅ 成功編輯發票 (AA11111111)，資料正確載入、金額正確計算、更新成功儲存

### 8. 減項商品自動轉負數 ✅
**功能描述**：當使用者選擇「減預收貨款」等減項商品時，系統自動將輸入的正數金額轉為負數

**實作邏輯**：
- **判斷規則**：品名包含「減」字的商品視為減項商品
- **自動轉換**：使用者輸入 500，系統自動儲存為 -500
- **顯示處理**：金額欄位顯示絕對值（500），但實際儲存為負數（-500）
- **品名切換**：當品名從一般商品改為減項商品時，自動將金額轉為負數；反之亦然

**修正內容**：
- **前端** [InvoiceForm.vue:127-135](d:\Code\Accounting-Management-System\front_end\accounting-frontend\src\components\InvoiceForm.vue#L127-L135)：金額輸入欄位改用雙向綁定，顯示絕對值，根據品名動態提示
- **前端** [InvoiceForm.vue:238-257](d:\Code\Accounting-Management-System\front_end\accounting-frontend\src\components\InvoiceForm.vue#L238-L257)：新增判斷、顯示、處理函數
- **前端** [InvoiceForm.vue:371-391](d:\Code\Accounting-Management-System\front_end\accounting-frontend\src\components\InvoiceForm.vue#L371-L391)：監聽品名變化自動調整正負號

**使用範例**：
1. 選擇品名「減預收貨款」
2. 輸入金額 500
3. 系統自動儲存為 -500
4. 計算總金額時自動減去 500

**測試結果**: ✅ 使用者只需輸入正數，系統自動處理正負號