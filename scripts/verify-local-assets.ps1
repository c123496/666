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
  $root = Invoke-WebRequest 'http://127.0.0.1:5000' -UseBasicParsing -ErrorAction Stop
  $rootHtml = $root.Content

  $cssMatch = [regex]::Match($rootHtml, 'href="(?<url>/_next/static/css/[^"]+\.css)"')
  $jsMatch = [regex]::Match($rootHtml, 'src="(?<url>/_next/static/chunks/[^"]+\.js)"')

  if (-not $cssMatch.Success) {
    throw 'Failed to find CSS asset in homepage HTML.'
  }

  if (-not $jsMatch.Success) {
    throw 'Failed to find JS asset in homepage HTML.'
  }

  $cssUrl = "http://127.0.0.1:5000$($cssMatch.Groups['url'].Value)"
  $jsUrl = "http://127.0.0.1:5000$($jsMatch.Groups['url'].Value)"

  $css = Invoke-WebRequest $cssUrl -UseBasicParsing -ErrorAction Stop
  $js = Invoke-WebRequest $jsUrl -UseBasicParsing -ErrorAction Stop

  Write-Output ("ROOT_STATUS={0}" -f [int]$root.StatusCode)
  Write-Output ("CSS_STATUS={0}" -f [int]$css.StatusCode)
  Write-Output ("JS_STATUS={0}" -f [int]$js.StatusCode)
  Write-Output ("CSS_URL={0}" -f $cssMatch.Groups['url'].Value)
  Write-Output ("JS_URL={0}" -f $jsMatch.Groups['url'].Value)
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
