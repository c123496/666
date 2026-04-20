@echo off
cd /d "%~dp0"
echo ========================================
echo   虚拟男友开发服务器
echo ========================================
echo.
echo 正在启动服务器...
echo 服务器地址: http://localhost:5000
echo.
echo 按 Ctrl+C 停止服务器
echo ========================================
echo.

npx next dev -p 5000

pause
