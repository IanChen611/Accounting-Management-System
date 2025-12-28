@echo off
chcp 65001 >nul
color 0A
title 會計管理系統 - 啟動中...

echo ========================================
echo    會計管理系統 啟動程式
echo ========================================
echo.
echo 正在啟動系統，請稍候...
echo.

echo [1/2] 正在啟動後端伺服器...
cd /d "%~dp0back_end\accounting-backend"
start "後端伺服器 (NestJS)" cmd /k "npm run start:dev"

echo [2/2] 正在啟動前端介面...
timeout /t 5 /nobreak >nul
cd /d "%~dp0front_end\accounting-frontend"
start "前端介面 (Vue)" cmd /k "npm run dev"

echo.
echo ========================================
echo 系統啟動完成！
echo ========================================
echo.
echo 後端伺服器：http://localhost:3001
echo 前端介面：  http://localhost:5173
echo.
echo 請等待約 10-15 秒讓系統完全啟動
echo 啟動完成後會自動開啟瀏覽器
echo.
echo 關閉此視窗不會停止系統運作
echo 如需停止系統，請執行「停止系統.bat」
echo ========================================
echo.

timeout /t 10 /nobreak >nul
start http://localhost:5173

exit
