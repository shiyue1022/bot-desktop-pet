$ErrorActionPreference='Stop'
$bundle=$PSScriptRoot
$target=Join-Path $env:LOCALAPPDATA 'Programs\bot'
if (-not (Test-Path -LiteralPath (Join-Path $bundle 'bot.exe'))) { throw 'bot.exe not found. Extract the complete ZIP first.' }
if (Get-Process -Name 'bot' -ErrorAction SilentlyContinue) { throw 'Exit bot from its tray menu before installing.' }
New-Item -ItemType Directory -Path $target -Force | Out-Null
if ([IO.Path]::GetFullPath($bundle) -ne [IO.Path]::GetFullPath($target)) {
 Get-ChildItem -LiteralPath $bundle -Force | Where-Object Name -NotIn @('Install.cmd','install.ps1') | Copy-Item -Destination $target -Recurse -Force
}
$ws=New-Object -ComObject WScript.Shell
$desktop=[Environment]::GetFolderPath('Desktop')
$link=$ws.CreateShortcut((Join-Path $desktop 'bot.lnk'))
$link.TargetPath=Join-Path $target 'bot.exe'
$link.WorkingDirectory=$target
$link.IconLocation=(Join-Path $target 'bot.ico')+',0'
$link.Description='bot desktop pet'
$link.Save()
$grokLink=Join-Path $desktop 'Grok Bot.lnk'
if (Test-Path -LiteralPath $grokLink) {
 $g=$ws.CreateShortcut($grokLink)
 if ($g.Arguments -notmatch 'remote-debugging-port=19222') {
  $g.Arguments=($g.Arguments+' --remote-debugging-address=127.0.0.1 --remote-debugging-port=19222').Trim()
  $g.Save()
 }
}
Start-Process -FilePath (Join-Path $target 'bot.exe') -WindowStyle Hidden
Write-Host 'bot installed. Desktop shortcut created. Restart Grok Bot from its desktop shortcut to enable activity sync.'
