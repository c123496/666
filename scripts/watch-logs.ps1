# 监控开发服务器日志
Write-Host "🚀 启动开发服务器并监控日志..." -ForegroundColor Green

# 清理端口
$port = 5000
$processes = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue |
    Select-Object -ExpandProperty OwningProcess -ErrorAction SilentlyContinue |
    Sort-Object -Unique

if ($processes) {
    Write-Host "🔧 清理端口 $port 上的进程..." -ForegroundColor Yellow
    Stop-Process -Id $processes -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 1
}

Write-Host "✅ 启动服务器..." -ForegroundColor Green
Write-Host "📺 服务器地址: http://localhost:$port" -ForegroundColor Cyan
Write-Host "📝 按 Ctrl+C 停止服务器" -ForegroundColor Yellow
Write-Host ""

# 启动服务器
$env:PORT = $port
npx tsx watch src/server.ts
