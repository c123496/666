@echo off
title 虚拟男友开发服务器 - 稳定版本
chcp 65001 >nul
color 0A

echo ========================================
echo   虚拟男友开发服务器 - 稳定启动
echo ========================================
echo.

echo [1/3] 清理缓存...
if exist .next (
    rmdir /s /q .next
    echo 缓存已清理
) else (
    echo 无缓存需要清理
)
echo.

echo [2/3] 清理端口 5000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do (
    taskkill /F /PID %%a 2>nul
)
echo 端口清理完成
echo.

echo [3/3] 启动开发服务器...
echo.
echo ========================================
echo   服务器地址: http://localhost:5000
echo   按 Ctrl+C 停止服务器
echo ========================================
echo.

npx next dev -p 5000

pause
