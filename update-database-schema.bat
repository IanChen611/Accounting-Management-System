@echo off
echo ========================================
echo 資料庫 Schema 更新腳本
echo ========================================
echo.
echo 這個腳本會更新資料庫，新增以下欄位：
echo 1. invoices.isVoided (作廢標記)
echo 2. customers.zipCode (郵遞區號)
echo.
echo 請輸入 MySQL root 密碼...
echo.

"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p accounting_system < update-schema.sql

echo.
echo ========================================
echo Schema 更新完成！
echo ========================================
echo.
echo 接下來請執行客戶資料匯入：
echo node reimport-customers-with-zipcode.js
echo.
pause
