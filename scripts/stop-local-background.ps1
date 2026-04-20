$ErrorActionPreference = 'Stop'

$projectDir = Split-Path -Parent $PSScriptRoot
$pidFile = Join-Path $projectDir 'run-local-server.pid'

if (-not (Test-Path $pidFile)) {
  Write-Output 'NO_PID_FILE'
  exit 0
}

$serverPid = Get-Content $pidFile | Select-Object -First 1

if ($serverPid) {
  try {
    Stop-Process -Id ([int]$serverPid) -Force -ErrorAction Stop
    Write-Output "STOPPED_PID=$serverPid"
  }
  catch {
    Write-Output "PID_NOT_RUNNING=$serverPid"
  }
}

Remove-Item $pidFile -Force -ErrorAction SilentlyContinue
