$ErrorActionPreference = 'Stop'

$projectDir = Split-Path -Parent $PSScriptRoot
$logPath = Join-Path $projectDir 'run-local-session.log'
$errorLogPath = Join-Path $projectDir 'run-local-error.log'

Set-Location $projectDir
$env:PORT = '5000'
$env:HOSTNAME = '0.0.0.0'
$env:BROWSER_URL = 'http://127.0.0.1:5000'

if (Test-Path $logPath) {
  Remove-Item $logPath -Force
}

if (Test-Path $errorLogPath) {
  Remove-Item $errorLogPath -Force
}

& node 'scripts\run-local-server.js' 1>> $logPath 2>> $errorLogPath
