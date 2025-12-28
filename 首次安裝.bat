@echo off
chcp 65001 >nul
color 0B
title 會計管理系統 - 首次安裝

echo ========================================
echo    會計管理系統 - 首次安裝程式
echo ========================================
echo.
echo 這是新電腦第一次使用本系統時執行的安裝程式
echo 會自動安裝所有必要的相依套件
echo.
echo 預計需要 3-5 分鐘，請耐心等待...
echo ========================================
echo.
pause

echo [1/2] 正在安裝後端相依套件...
echo.
cd /d "%~dp0back_end\accounting-backend"
call npm install
if %errorlevel% neq 0 (
    echo.
    echo ✗ 後端安裝失敗！請檢查 Node.js 是否已安裝
    pause
    exit /b 1
)
echo.
echo ✓ 後端套件安裝完成
echo.

echo [2/2] 正在安裝前端相依套件...
echo.
cd /d "%~dp0front_end\accounting-frontend"
call npm install
if %errorlevel% neq 0 (
    echo.
    echo ✗ 前端安裝失敗！請檢查 Node.js 是否已安裝
    pause
    exit /b 1
)
echo.
echo ✓ 前端套件安裝完成
echo.

cd /d "%~dp0"
echo ========================================
echo 安裝完成！
echo ========================================
echo.
echo 接下來請依序執行：
echo 1. update-database-schema.bat （更新資料庫結構）
echo 2. import-customers-data.bat （匯入客戶資料）
echo 3. 啟動系統.bat （啟動系統）
echo.
echo 詳細說明請參考「系統使用說明.txt」
echo ========================================
pause
