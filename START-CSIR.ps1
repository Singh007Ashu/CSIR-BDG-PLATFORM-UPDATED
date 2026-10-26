$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -LiteralPath $projectRoot

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Host "Node.js is not available. Install it with: winget install OpenJS.NodeJS.LTS" -ForegroundColor Red
  exit 1
}

if (-not (Test-Path -LiteralPath ".env")) {
  Copy-Item -LiteralPath ".env.example" -Destination ".env"
  Write-Host "Created .env from .env.example" -ForegroundColor Green
}

if (-not (Test-Path -LiteralPath "node_modules")) {
  Write-Host "Installing project dependencies..." -ForegroundColor Cyan
  & npm.cmd install
}

Write-Host "Checking the local database schema..." -ForegroundColor Cyan
& npm.cmd run db:push

Write-Host "Starting CSIR-BDG Platform..." -ForegroundColor Green
Write-Host "Open http://localhost:3000 in your browser. Keep this window open." -ForegroundColor Yellow
& npm.cmd run dev
