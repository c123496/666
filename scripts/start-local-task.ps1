$ErrorActionPreference = 'Stop'

$taskName = 'CodexLocalProjectsServer'
$taskScriptPath = Join-Path $PSScriptRoot 'run-local-task.ps1'
$startAt = (Get-Date).AddMinutes(1)
$taskArgs = "-NoProfile -ExecutionPolicy Bypass -File `"$taskScriptPath`""

Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction SilentlyContinue | Out-Null

$action = New-ScheduledTaskAction -Execute 'powershell.exe' -Argument $taskArgs
$trigger = New-ScheduledTaskTrigger -Once -At $startAt
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable

Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings | Out-Null
Start-ScheduledTask -TaskName $taskName

$ready = $false
for ($i = 0; $i -lt 30; $i++) {
  Start-Sleep -Seconds 1
  try {
    $resp = Invoke-WebRequest 'http://127.0.0.1:5000' -UseBasicParsing -ErrorAction Stop
    if ($resp.StatusCode -ge 200 -and $resp.StatusCode -lt 400) {
      $ready = $true
      break
    }
  }
  catch {
  }
}

if (-not $ready) {
  throw 'Scheduled task started, but local server did not become ready.'
}

Write-Output 'READY_URL=http://127.0.0.1:5000'
Write-Output "TASK_NAME=$taskName"
