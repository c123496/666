$ErrorActionPreference = 'Stop'

$projectDir = Split-Path -Parent $PSScriptRoot
$port = if ($env:PORT) { [int]$env:PORT } else { 5000 }
$hostName = if ($env:HOSTNAME) { $env:HOSTNAME } else { '0.0.0.0' }
$browserUrl = if ($env:BROWSER_URL) { $env:BROWSER_URL } else { "http://127.0.0.1:$port" }
$logPath = Join-Path $projectDir 'run-local-session.log'

function Open-Browser {
  param([string]$Url)

  $browserCandidates = @(
    'C:\Program Files\Google\Chrome\Application\chrome.exe',
    'C:\Program Files (x86)\Google\Chrome\Application\chrome.exe',
    'C:\Program Files\Microsoft\Edge\Application\msedge.exe',
    'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',
    'C:\Program Files\Mozilla Firefox\firefox.exe',
    'C:\Program Files (x86)\Mozilla Firefox\firefox.exe'
  )

  foreach ($browserPath in $browserCandidates) {
    if (Test-Path $browserPath) {
      Start-Process -FilePath $browserPath -ArgumentList $Url
      return
    }
  }

  Start-Process explorer.exe -ArgumentList $Url
}

if (Test-Path $logPath) {
  Remove-Item $logPath -Force
}

$browserJob = Start-Job -ArgumentList $port, $browserUrl, $logPath -ScriptBlock {
  param(
    [int]$ProbePort,
    [string]$Url,
    [string]$JobLogPath
  )

  function Write-JobLog {
    param([string]$Message)

    $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    Add-Content -Path $JobLogPath -Value "[$timestamp] $Message"
  }

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
        Write-JobLog "Launching browser via $($browser.Path) $($browser.Args -join ' ')"
        Start-Process -FilePath $browser.Path -ArgumentList $browser.Args
        return
      }
    }

    Write-JobLog "Launching browser via explorer.exe $TargetUrl"
    Start-Process explorer.exe -ArgumentList $TargetUrl
  }

  $deadline = (Get-Date).AddSeconds(30)
  while ((Get-Date) -lt $deadline) {
    try {
      $response = Invoke-WebRequest "http://127.0.0.1:$ProbePort" -UseBasicParsing -ErrorAction Stop
      if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 400) {
        Write-JobLog "Health check passed with status $($response.StatusCode)"
        Open-Browser -TargetUrl $Url
        return
      }
    }
    catch {
      Start-Sleep -Milliseconds 500
    }
  }
}

Set-Location $projectDir
$env:PORT = [string]$port
$env:HOSTNAME = $hostName
$env:BROWSER_URL = $browserUrl

Write-Host "Starting local site at $browserUrl"
Write-Host "Keep this window open while you use the site."
Write-Host "Live log: $logPath"
Write-Host ""

try {
  & node 'scripts\run-local-server.js' 2>&1 | Tee-Object -FilePath $logPath
}
finally {
  if ($browserJob) {
    $null = Receive-Job -Job $browserJob -Wait -AutoRemoveJob
  }

  Write-Host ""
  Write-Host "Server stopped. Press Enter to close this window."
  [void](Read-Host)
}
