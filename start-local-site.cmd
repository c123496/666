@echo off
setlocal
cd /d "%~dp0"
start "" powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\start-local.ps1"
