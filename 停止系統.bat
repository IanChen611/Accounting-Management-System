@echo off
chcp 65001 >nul
color 0C
title 會計管理系統 - 停止中...

echo ========================================
echo    會計管理系統 停止程式
echo ========================================
echo.
echo 正在停止所有服務...
echo.

echo [1/2] 正在停止前端介面 (Vue)...
taskkill /FI "WindowTitle eq 前端介面 (Vue)*" /T /F >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ 前端介面已停止
) else (
    echo ✓ 前端介面未運行
)

echo [2/2] 正在停止後端伺服器 (NestJS)...
taskkill /FI "WindowTitle eq 後端伺服器 (NestJS)*" /T /F >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ 後端伺服器已停止
) else (
    echo ✓ 後端伺服器未運行
)

echo.
echo ========================================
echo 系統已完全停止
echo ========================================
echo.
pause
