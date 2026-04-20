$ErrorActionPreference = 'SilentlyContinue'

$taskName = 'CodexLocalProjectsServer'

Stop-ScheduledTask -TaskName $taskName | Out-Null
Unregister-ScheduledTask -TaskName $taskName -Confirm:$false | Out-Null

Write-Output "STOPPED_TASK=$taskName"
