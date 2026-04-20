$ErrorActionPreference = 'Stop'

$projectDir = Split-Path -Parent $PSScriptRoot
$stdoutLog = Join-Path $projectDir 'tmp-server-out.log'
$stderrLog = Join-Path $projectDir 'tmp-server-err.log'

if (Test-Path $stdoutLog) {
  Remove-Item $stdoutLog -Force
}

if (Test-Path $stderrLog) {
  Remove-Item $stderrLog -Force
}

$proc = Start-Process `
  -FilePath node `
  -ArgumentList 'scripts/run-local-server.js' `
  -WorkingDirectory $projectDir `
  -RedirectStandardOutput $stdoutLog `
  -RedirectStandardError $stderrLog `
  -PassThru

Start-Sleep -Seconds 5

try {
  $resp = Invoke-WebRequest 'http://127.0.0.1:5000' -UseBasicParsing -ErrorAction Stop
  Write-Output ("STATUS={0}" -f [int]$resp.StatusCode)

  if ($resp.Content.Length -gt 1200) {
    Write-Output $resp.Content.Substring(0, 1200)
  }
  else {
    Write-Output $resp.Content
  }

  Write-Output ("HAS_EXITED={0}" -f $proc.HasExited)
}
finally {
  if ($proc -and -not $proc.HasExited) {
    Stop-Process -Id $proc.Id -Force
  }

  Write-Output '--- STDOUT ---'
  if (Test-Path $stdoutLog) {
    Get-Content $stdoutLog -Tail 50
  }

  Write-Output '--- STDERR ---'
  if (Test-Path $stderrLog) {
    Get-Content $stderrLog -Tail 50
  }
}
