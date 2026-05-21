# Notion_alternative.dev setup script
# Run from project root: .\scripts\setup.ps1

Write-Host "=== Installing dependencies ===" -ForegroundColor Cyan
pnpm install

Write-Host "=== Setting up environment ===" -ForegroundColor Cyan
if (-not (Test-Path .env)) {
  Copy-Item .env.example .env
  Write-Host "Created .env from .env.example — fill in your values." -ForegroundColor Yellow
} else {
  Write-Host ".env already exists, skipping." -ForegroundColor Green
}

Write-Host "=== Installing Git hooks ===" -ForegroundColor Cyan
pnpm husky

Write-Host "=== Verifying toolchain ===" -ForegroundColor Cyan
$rustOk = $true
try { rustc --version | Out-Null } catch { $rustOk = $false }
try { cargo --version | Out-Null } catch { $rustOk = $false }

if (-not $rustOk) {
  Write-Host "WARNING: Rust is not installed or not in PATH." -ForegroundColor Yellow
  Write-Host "Install from: https://rustup.rs" -ForegroundColor Yellow
  Write-Host "Then run: rustup default stable" -ForegroundColor Yellow
} else {
  Write-Host "Rust toolchain: $(rustc --version)" -ForegroundColor Green
  Write-Host "Cargo: $(cargo --version)" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== Setup complete ===" -ForegroundColor Green
Write-Host "Run 'pnpm tauri dev' to start the development server."
