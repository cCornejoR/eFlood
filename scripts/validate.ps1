# eFlow - Local Validation Script (Windows)
# This script runs all validation checks locally before committing

param(
    [switch]$Fix
)

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Cyan"

# Counters
$TotalErrors = 0
$TotalWarnings = 0

function Write-Status {
    param($Message)
    Write-Host "[INFO] $Message" -ForegroundColor $Blue
}

function Write-Success {
    param($Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor $Green
}

function Write-Warning {
    param($Message)
    Write-Host "[WARNING] $Message" -ForegroundColor $Yellow
}

function Write-Error {
    param($Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $Red
}

function Write-Section {
    param($Title)
    Write-Host ""
    Write-Host "========================================" -ForegroundColor $Blue
    Write-Host " $Title" -ForegroundColor $Blue
    Write-Host "========================================" -ForegroundColor $Blue
}

# Check if we're in the right directory
if (-not (Test-Path "package.json") -or -not (Test-Path "src") -or -not (Test-Path "src-python")) {
    Write-Error "Please run this script from the project root directory"
    exit 1
}

Write-Host "🔍 Running eFlow validation checks..." -ForegroundColor $Blue

# Frontend validation
Write-Section "Frontend Validation"

Set-Location frontend

Write-Status "Running TypeScript type checking..."
try {
    npm run type-check
    Write-Success "TypeScript type checking passed"
} catch {
    Write-Error "TypeScript type checking failed"
    $TotalErrors++
}

Write-Status "Running ESLint..."
try {
    if ($Fix) {
        npm run lint:fix
    } else {
        npm run lint
    }
    Write-Success "ESLint passed"
} catch {
    Write-Error "ESLint failed"
    Write-Warning "Run with -Fix flag or 'npm run lint:fix' to auto-fix some issues"
    $TotalErrors++
}

Write-Status "Checking code formatting..."
try {
    if ($Fix) {
        npm run format
        Write-Success "Code formatted"
    } else {
        npm run format:check
        Write-Success "Code formatting is correct"
    }
} catch {
    Write-Error "Code formatting issues found"
    Write-Warning "Run with -Fix flag or 'npm run format' to fix formatting"
    $TotalErrors++
}

Write-Status "Running tests..."
try {
    npm run test -- --run
    Write-Success "All tests passed"
} catch {
    Write-Error "Some tests failed"
    $TotalErrors++
}

Write-Status "Testing build..."
try {
    npm run build
    Write-Success "Build successful"
} catch {
    Write-Error "Build failed"
    $TotalErrors++
}

Set-Location ..

# Python validation
Write-Section "Python Backend Validation"

Set-Location backend/src-python

if (Get-Command uv -ErrorAction SilentlyContinue) {
    Write-Status "Running Python linting (flake8)..."
    try {
        uv run flake8 .
        Write-Success "Python linting passed"
    } catch {
        Write-Error "Python linting failed"
        $TotalErrors++
    }

    Write-Status "Checking Python formatting (black)..."
    try {
        if ($Fix) {
            uv run black .
            Write-Success "Python code formatted"
        } else {
            uv run black --check .
            Write-Success "Python formatting is correct"
        }
    } catch {
        Write-Error "Python formatting issues found"
        Write-Warning "Run with -Fix flag or 'uv run black .' to fix formatting"
        $TotalErrors++
    }

    Write-Status "Checking import sorting (isort)..."
    try {
        if ($Fix) {
            uv run isort .
            Write-Success "Imports sorted"
        } else {
            uv run isort --check-only .
            Write-Success "Import sorting is correct"
        }
    } catch {
        Write-Error "Import sorting issues found"
        Write-Warning "Run with -Fix flag or 'uv run isort .' to fix imports"
        $TotalErrors++
    }

    Write-Status "Running type checking (mypy)..."
    try {
        uv run mypy .
        Write-Success "Python type checking passed"
    } catch {
        Write-Warning "Python type checking issues found"
        $TotalWarnings++
    }

    Write-Status "Running Python tests..."
    try {
        uv run pytest
        Write-Success "Python tests passed"
    } catch {
        Write-Error "Python tests failed"
        $TotalErrors++
    }
} else {
    Write-Warning "UV not found, skipping Python validation"
    Write-Warning "Install UV from https://github.com/astral-sh/uv"
}

Set-Location ..\..

# Rust validation
Write-Section "Rust Backend Validation"

Set-Location backend/src-tauri

if (Get-Command cargo -ErrorAction SilentlyContinue) {
    Write-Status "Checking Rust formatting..."
    try {
        if ($Fix) {
            cargo fmt --all
            Write-Success "Rust code formatted"
        } else {
            cargo fmt --all -- --check
            Write-Success "Rust formatting is correct"
        }
    } catch {
        Write-Error "Rust formatting issues found"
        Write-Warning "Run with -Fix flag or 'cargo fmt --all' to fix formatting"
        $TotalErrors++
    }

    Write-Status "Running Clippy linting..."
    try {
        cargo clippy --all-targets --all-features -- -D warnings
        Write-Success "Clippy linting passed"
    } catch {
        Write-Warning "Clippy warnings found"
        $TotalWarnings++
    }

    Write-Status "Running Rust tests..."
    try {
        cargo test
        Write-Success "Rust tests passed"
    } catch {
        Write-Error "Rust tests failed"
        $TotalErrors++
    }

    Write-Status "Testing Rust build..."
    try {
        cargo build
        Write-Success "Rust build successful"
    } catch {
        Write-Error "Rust build failed"
        $TotalErrors++
    }
} else {
    Write-Warning "Cargo not found, skipping Rust validation"
    Write-Warning "Install Rust from https://rustup.rs/"
}

Set-Location ..\..

# Security audit
Write-Section "Security Audit"

Write-Status "Running npm security audit..."
Set-Location frontend
try {
    npm audit --audit-level=moderate
    Write-Success "No security vulnerabilities found"
} catch {
    Write-Warning "Security vulnerabilities found"
    Write-Warning "Run 'npm audit fix' to fix automatically"
    $TotalWarnings++
}
Set-Location ..

# Final summary
Write-Section "Validation Summary"

Write-Host "Total Errors: $TotalErrors"
Write-Host "Total Warnings: $TotalWarnings"
Write-Host ""

if ($TotalErrors -eq 0) {
    Write-Success "All critical validations passed! Ready to commit."
    Write-Host ""
    Write-Host "Quick fix commands:" -ForegroundColor $Yellow
    Write-Host "  - Format all: .\scripts\validate.ps1 -Fix"
    Write-Host "  - Frontend: npm run format; npm run lint --fix"
    Write-Host "  - Python: cd src-python; uv run black .; uv run isort ."
    Write-Host "  - Rust: cd src-tauri; cargo fmt --all"
    exit 0
} else {
    Write-Error "Validation failed with $TotalErrors errors"
    Write-Host ""
    Write-Host "Fix commands:" -ForegroundColor $Yellow
    Write-Host "  - Auto-fix: .\scripts\validate.ps1 -Fix"
    Write-Host "  - Frontend: npm run format; npm run lint --fix"
    Write-Host "  - Python: cd src-python; uv run black .; uv run isort ."
    Write-Host "  - Rust: cd src-tauri; cargo fmt --all"
    exit 1
}
