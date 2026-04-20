# 虚拟男友开发服务器 - 详细日志监控
# 解决 Turbopack 问题的稳定版本

$ErrorActionPreference = "Continue"

# 设置控制台编码
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

function Show-Header {
    Clear-Host
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  虚拟男友开发服务器 - 日志监控" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📍 项目路径: $PSScriptRoot" -ForegroundColor Green
    Write-Host "🌐 服务器地址: http://localhost:5000" -ForegroundColor Yellow
    Write-Host "📝 按 Ctrl+C 停止服务器" -ForegroundColor Red
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
}

function Clear-Caches {
    Write-Host "🧹 清理缓存文件..." -ForegroundColor Yellow

    $nextPath = Join-Path $PSScriptRoot ".next"
    if (Test-Path $nextPath) {
        Remove-Item -Path $nextPath -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "  ✅ .next 缓存已清理" -ForegroundColor Green
    }

    $cachePath = Join-Path $PSScriptRoot "node_modules\.cache"
    if (Test-Path $cachePath) {
        Remove-Item -Path $cachePath -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "  ✅ node_modules\.cache 已清理" -ForegroundColor Green
    }

    Write-Host ""
}

function Clear-Port {
    param([int]$Port = 5000)

    Write-Host "🔧 清理端口 $Port..." -ForegroundColor Yellow

    try {
        $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        if ($connections) {
            $processes = $connections | Select-Object -ExpandProperty OwningProcess -ErrorAction SilentlyContinue | Sort-Object -Unique

            if ($processes) {
                Write-Host "  发现占用进程: $($processes -join ', ')" -ForegroundColor Red

                foreach ($pid in $processes) {
                    try {
                        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                        Write-Host "  ✅ 已终止进程 $pid" -ForegroundColor Green
                    } catch {
                        Write-Host "  ❌ 无法终止进程 $pid" -ForegroundColor Red
                    }
                }

                Start-Sleep -Seconds 1
            }
        }

        Write-Host "  ✅ 端口 $Port 已就绪" -ForegroundColor Green
    } catch {
        Write-Host "  ⚠️  端口检查出现错误: $_" -ForegroundColor Red
    }

    Write-Host ""
}

function Start-DevServer {
    Write-Host "🚀 启动开发服务器..." -ForegroundColor Green
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""

    # 设置环境变量禁用 Turbopack
    $env:TURBOPACK = "0"

    # 启动 Next.js 开发服务器
    try {
        npx next dev -p 5000
    }
    catch {
        Write-Host "❌ 服务器启动失败: $_" -ForegroundColor Red
        Write-Host ""
        Write-Host "💡 建议:" -ForegroundColor Yellow
        Write-Host "  1. 确保已安装依赖: pnpm install" -ForegroundColor White
        Write-Host "  2. 检查端口 5000 是否被其他程序占用" -ForegroundColor White
        Write-Host "  3. 查看错误日志了解详情" -ForegroundColor White
        pause
    }
}

# 主程序
Show-Header
Clear-Caches
Clear-Port
Start-DevServer
