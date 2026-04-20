$ErrorActionPreference = 'Stop'

$projectDir = Split-Path -Parent $PSScriptRoot
$port = 5000
$browserUrl = "http://127.0.0.1:$port"
$stdoutLog = Join-Path $projectDir 'run-local-session.log'
$stderrLog = Join-Path $projectDir 'run-local-error.log'
$pidFile = Join-Path $projectDir 'run-local-server.pid'

function Open-Browser {
  param([string]$TargetUrl)

  $browserCandidates = @(
    @{ Path = 'C:\Program Files\Google\Chrome\Application\chrome.exe'; Args = @('--new-window', $TargetUrl) },
    @{ Path = 'C:\Program Files (x86)\Google\Chrome\Application\chrome.exe'; Args = @('--new-window', $TargetUrl) },
    @{ Path = 'C:\Program Files\Microsoft\Edge\Application\msedge.exe'; Args = @('--new-window', $TargetUrl) },
    @{ Path = 'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'; Args = @('--new-window', $TargetUrl) },
    @{ Path = 'C:\Program Files\Mozilla Firefox\firefox.exe'; Args = @('-new-window', $TargetUrl) },
    @{ Path = 'C:\Program Files (x86)\Mozilla Firefox\firefox.exe'; Args = @('-new-window', $TargetUrl) }
  )

  foreach ($browser in $browserCandidates) {
    if (Test-Path $browser.Path) {
      Start-Process -FilePath $browser.Path -ArgumentList $browser.Args
      return $browser.Path
    }
  }

  Start-Process explorer.exe -ArgumentList $TargetUrl
  return 'explorer.exe'
}

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
  -WindowStyle Hidden `
  -RedirectStandardOutput $stdoutLog `
  -RedirectStandardError $stderrLog `
  -PassThru

Set-Content -Path $pidFile -Value $proc.Id

$ready = $false
for ($i = 0; $i -lt 30; $i++) {
  Start-Sleep -Seconds 1

  try {
    $resp = Invoke-WebRequest $browserUrl -UseBasicParsing -ErrorAction Stop
    if ($resp.StatusCode -ge 200 -and $resp.StatusCode -lt 400) {
      $ready = $true
      break
    }
  }
  catch {
  }
}

if (-not $ready) {
  throw "Local server did not become ready at $browserUrl"
}

$browserPath = Open-Browser -TargetUrl $browserUrl

Write-Output "READY_URL=$browserUrl"
Write-Output "SERVER_PID=$($proc.Id)"
Write-Output "BROWSER=$browserPath"
