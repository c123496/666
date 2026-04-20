@echo off
setlocal
cd /d "%~dp0.."
ping -n 10 127.0.0.1 >nul
echo done> "%CD%\explorer-test.txt"
