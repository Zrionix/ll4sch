# Run on SERVER as Admin AFTER nvidia-smi works.
# Does not print .env. Leaves XAI_API_KEY alone.
# 14B Q4 fits a 12 GB 3080 Ti next to Paper and Valheim.

$ErrorActionPreference = "Stop"

winget install --id Ollama.Ollama -e --accept-package-agreements --accept-source-agreements
$env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")

if (-not (Get-Command nvidia-smi -ErrorAction SilentlyContinue)) {
  Write-Error "nvidia-smi is missing. Install the driver, reboot, then run this again."
}
nvidia-smi --query-gpu=name,memory.total --format=csv,noheader

$env:OLLAMA_FLASH_ATTENTION = "1"
[System.Environment]::SetEnvironmentVariable("OLLAMA_FLASH_ATTENTION", "1", "Machine")

ollama pull qwen2.5:14b

Set-Service -Name "Ollama" -StartupType Automatic -ErrorAction SilentlyContinue
Start-Service -Name "Ollama" -ErrorAction SilentlyContinue
ollama ps

$envFile = "C:\Users\Admin\Desktop\Discord bot\.env"
if (-not (Test-Path $envFile)) {
  Write-Error "Missing $envFile"
}
$lines = Get-Content $envFile | Where-Object {
  $_ -notmatch '^\s*LMSTUDIO_BASE_URL=' -and $_ -notmatch '^\s*LMSTUDIO_MODEL='
}
$lines += "LMSTUDIO_BASE_URL=http://127.0.0.1:11434/v1"
$lines += "LMSTUDIO_MODEL=qwen2.5:14b"
Set-Content -Path $envFile -Value $lines -Encoding utf8

Get-CimInstance Win32_Process -Filter "Name='python.exe'" |
  Where-Object { $_.CommandLine -like '*bot.py*' } |
  ForEach-Object { Stop-Process -Id $_.ProcessId -Force }
Start-Process -FilePath "C:\Users\Admin\Desktop\Discord bot\start.bat" -WorkingDirectory "C:\Users\Admin\Desktop\Discord bot"
Write-Host "Demetrius restarted against qwen2.5:14b on 127.0.0.1:11434"
