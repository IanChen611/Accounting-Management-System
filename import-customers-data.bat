@echo off
echo ========================================
echo 客戶資料匯入腳本
echo ========================================
echo.
echo 這個腳本會將客戶資料匯入到資料庫
echo.
echo 請輸入 MySQL root 密碼...
echo.

"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p accounting_system < import-customers.sql

echo.
echo ========================================
echo 客戶資料匯入完成！
echo ========================================
echo.
pause
