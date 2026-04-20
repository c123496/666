@echo off
setlocal
cd /d "%~dp0.."
wmic.exe path Win32_Process call create "cmd.exe /c ping -n 10 127.0.0.1 >nul & echo done > \"%CD%\\wmi-test.txt\""
