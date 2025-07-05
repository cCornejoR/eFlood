# Simple validation script for eFlow
Write-Host "Running simple validation..." -ForegroundColor Cyan

$ErrorCount = 0

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "[ERROR] Not in project root directory" -ForegroundColor Red
    exit 1
}

# Frontend validation
Write-Host "Validating frontend..." -ForegroundColor Yellow
try {
    npm run lint
    if ($LASTEXITCODE -ne 0) { $ErrorCount++ }
} catch {
    Write-Host "[ERROR] Frontend linting failed" -ForegroundColor Red
    $ErrorCount++
}

# Python validation (if exists)
if (Test-Path "src-python") {
    Write-Host "Validating Python..." -ForegroundColor Yellow
    Set-Location src-python
    try {
        uv run black --check .
        if ($LASTEXITCODE -ne 0) { $ErrorCount++ }
    } catch {
        Write-Host "[WARNING] Python formatting check failed" -ForegroundColor Yellow
    }
    Set-Location ..
}

# Rust validation (if exists)
if (Test-Path "src-tauri") {
    Write-Host "Validating Rust..." -ForegroundColor Yellow
    Set-Location src-tauri
    try {
        cargo fmt --check
        if ($LASTEXITCODE -ne 0) { $ErrorCount++ }
    } catch {
        Write-Host "[WARNING] Rust formatting check failed" -ForegroundColor Yellow
    }
    Set-Location ..
}

if ($ErrorCount -eq 0) {
    Write-Host "All validations passed!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "Validation failed with $ErrorCount errors" -ForegroundColor Red
    exit 1
}
