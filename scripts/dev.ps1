# Windows PowerShell Development Server Script
# Equivalent to dev.sh for Windows environments

$PORT = 5000
$COZE_WORKSPACE_PATH = if ($env:COZE_WORKSPACE_PATH) { $env:COZE_WORKSPACE_PATH } else { Get-Location }

function Clear-Port {
    param([int]$PortNumber)

    Write-Host "Clearing port $PortNumber before start."

    try {
        # 获取占用指定端口的进程
        $processes = Get-NetTCPConnection -LocalPort $PortNumber -ErrorAction SilentlyContinue |
            Select-Object -ExpandProperty OwningProcess -ErrorAction SilentlyContinue |
            Sort-Object -Unique

        if ($processes) {
            Write-Host "Port $PortNumber in use by PIDs: $($processes -join ', ')"

            # 强制终止进程
            foreach ($pid in $processes) {
                try {
                    Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                } catch {
                    Write-Host "Failed to kill process $pid"
                }
            }

            Start-Sleep -Seconds 1

            # 再次检查端口状态
            $remaining = Get-NetTCPConnection -LocalPort $PortNumber -ErrorAction SilentlyContinue |
                Select-Object -ExpandProperty OwningProcess -ErrorAction SilentlyContinue |
                Sort-Object -Unique

            if ($remaining) {
                Write-Host "Warning: port $PortNumber still busy after kill, PIDs: $($remaining -join ', ')"
            } else {
                Write-Host "Port $PortNumber cleared."
            }
        } else {
            Write-Host "Port $PortNumber is free."
        }
    }
    catch {
        Write-Host "Error clearing port: $_"
    }
}

# 切换到工作目录
Set-Location $COZE_WORKSPACE_PATH

# 清理端口
Clear-Port -PortNumber $PORT

# 启动开发服务器
Write-Host "Starting HTTP service on port $PORT for dev..."
$env:PORT = $PORT
npx tsx watch src/server.ts
