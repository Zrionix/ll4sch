$ErrorActionPreference = "Stop"
$Dest = "C:\Project\ll4sch-wall"
New-Item -ItemType Directory -Force -Path $Dest | Out-Null

$Here = Split-Path -Parent $MyInvocation.MyCommand.Path
$Base = "https://raw.githubusercontent.com/Zrionix/ll4sch/main/server-wall"
foreach ($name in @("wall.py", "wall.html", "start-wall.bat")) {
  $source = Join-Path $Here $name
  $destFile = Join-Path $Dest $name
  if ((Test-Path $source) -and ($source -ne $destFile)) {
    Copy-Item $source $destFile -Force
  } else {
    Invoke-WebRequest -UseBasicParsing "$Base/$name" -OutFile $destFile
  }
}
if (-not (Test-Path (Join-Path $Dest "wall.py"))) {
  throw "wall.py is missing from $Dest"
}

function Find-Pythonw {
  $candidates = @(
    "$env:LOCALAPPDATA\Programs\Python\Python313\pythonw.exe",
    "$env:LOCALAPPDATA\Programs\Python\Python312\pythonw.exe",
    "$env:LOCALAPPDATA\Programs\Python\Python311\pythonw.exe",
    "$env:LOCALAPPDATA\Programs\Python\Python310\pythonw.exe",
    "C:\Python313\pythonw.exe",
    "C:\Python312\pythonw.exe",
    "C:\Python311\pythonw.exe",
    "C:\Python310\pythonw.exe"
  )
  foreach ($candidate in $candidates) {
    if (Test-Path $candidate) { return $candidate }
  }
  $cmd = Get-Command pythonw -ErrorAction SilentlyContinue
  if ($cmd) { return $cmd.Source }
  $cmd = Get-Command python -ErrorAction SilentlyContinue
  if ($cmd) {
    $beside = Join-Path (Split-Path $cmd.Source) "pythonw.exe"
    if (Test-Path $beside) { return $beside }
    return $cmd.Source
  }
  throw "Python was not found. Install Python 3 for the user who is logged into the main monitor."
}

$Pythonw = Find-Pythonw
Get-CimInstance Win32_Process | Where-Object {
  $_.Name -match '^(pythonw|python)\.exe$' -and $_.CommandLine -like '*ll4sch-wall*wall.py*'
} | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }

$Startup = [Environment]::GetFolderPath("Startup")
$Launcher = Join-Path $Startup "ll4sch-wall.bat"
@"
@echo off
timeout /t 8 /nobreak >nul
cd /d $Dest
start "" "$Pythonw" "$Dest\wall.py"
"@ | Set-Content -Path $Launcher -Encoding ASCII

Start-Process -FilePath $Pythonw -ArgumentList "`"$Dest\wall.py`"" -WorkingDirectory $Dest
Write-Output "pythonw=$Pythonw"
Write-Output "startup=$Launcher"
Write-Output "dest=$Dest"
Write-Output "started"
