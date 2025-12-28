/**
 * 讀取客代簡稱.xlsx 並生成客戶資料 SQL 腳本
 * 執行方式：node generate-customer-sql.js
 */

const XLSX = require('xlsx');
const fs = require('fs');

// 讀取 Excel 檔案
const workbook = XLSX.readFile('客代簡稱.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// 轉換為 JSON
const data = XLSX.utils.sheet_to_json(worksheet);

console.log(`讀取到 ${data.length} 筆客戶資料`);
console.log('前 3 筆資料範例：');
console.log(data.slice(0, 3));

// 生成 SQL
let sql = `-- 客戶資料匯入 SQL 腳本
-- 自動生成於 ${new Date().toISOString()}
-- 使用方式：mysql -u root -p accounting_system < import-customers.sql
-- 或使用批次檔：import-customers-data.bat

-- 設定字元編碼為 UTF-8
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

USE accounting_system;

-- 清空現有客戶資料（如需重新匯入，請取消註解）
-- TRUNCATE TABLE customers;

-- 插入客戶資料
INSERT INTO customers (code, name, zipCode, address, phone) VALUES
`;

const values = data.map((row, index) => {
  // 根據實際 Excel 欄位名稱調整
  const code = String(row['客戶供應商代號'] || '').trim();
  const name = String(row['客戶供應商簡稱'] || '').trim();
  const zipCode = String(row['郵遞區號'] || '').trim();
  const address = String(row['發票地址'] || '').trim();
  const phone = '';  // Excel 中沒有電話欄位

  // 跳過空資料
  if (!code || !name) {
    console.log(`跳過第 ${index + 1} 筆（缺少必要欄位）:`, row);
    return null;
  }

  // 跳過空白或無效的客戶
  if (code === 'null' || code === 'undefined' || code === '') {
    return null;
  }

  // 轉義單引號
  const escapeSql = (str) => String(str || '').replace(/'/g, "''");

  return `('${escapeSql(code)}', '${escapeSql(name)}', ${zipCode ? `'${escapeSql(zipCode)}'` : 'NULL'}, ${address ? `'${escapeSql(address)}'` : 'NULL'}, ${phone ? `'${escapeSql(phone)}'` : 'NULL'})`;
}).filter(v => v !== null);

sql += values.join(',\n');

sql += `
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  zipCode = VALUES(zipCode),
  address = VALUES(address),
  phone = VALUES(phone);

-- 顯示匯入結果
SELECT COUNT(*) as total_customers FROM customers;
SELECT '客戶資料匯入完成！' as status;
`;

// 寫入檔案
fs.writeFileSync('import-customers.sql', sql, 'utf8');

console.log(`\n✅ SQL 腳本已生成：import-customers.sql`);
console.log(`共 ${values.length} 筆有效客戶資料`);
console.log(`\n執行方式：`);
console.log(`1. Windows: import-customers-data.bat`);
console.log(`2. 直接執行: mysql -u root -p accounting_system < import-customers.sql`);
