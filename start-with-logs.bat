@echo off
title 虚拟男友开发服务器 - 日志监控
color 0A

echo ========================================
echo   虚拟男友开发服务器 - 启动并监控日志
echo ========================================
echo.

echo [1/2] 清理端口 5000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do (
    taskkill /F /PID %%a 2>nul
)
echo 端口清理完成！
echo.

echo [2/2] 启动开发服务器...
echo 服务器地址: http://localhost:5000
echo.
echo ========================================
echo   按 Ctrl+C 停止服务器
echo ========================================
echo.

npx tsx watch src/server.ts

pause
