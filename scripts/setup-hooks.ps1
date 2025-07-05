# eFlow - Setup Development Hooks (Windows)
# This script sets up pre-commit hooks and development environment on Windows

param(
    [switch]$Force
)

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Cyan"

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

Write-Host "🚀 Setting up eFlow development environment..." -ForegroundColor $Blue

# Check if we're in the right directory
if (-not (Test-Path "package.json") -or -not (Test-Path "src") -or -not (Test-Path "src-python")) {
    Write-Error "Please run this script from the project root directory"
    exit 1
}

# Check for Python
Write-Status "Checking for Python..."
try {
    $pythonVersion = python --version 2>&1
    Write-Success "Python found: $pythonVersion"
} catch {
    Write-Error "Python not found. Please install Python from https://python.org"
    exit 1
}

# Install pre-commit if not already installed
Write-Status "Checking for pre-commit..."
try {
    $precommitVersion = pre-commit --version 2>&1
    Write-Success "pre-commit found: $precommitVersion"
} catch {
    Write-Status "Installing pre-commit..."
    try {
        pip install pre-commit
        Write-Success "pre-commit installed successfully"
    } catch {
        Write-Error "Failed to install pre-commit. Please check your Python installation."
        exit 1
    }
}

# Install pre-commit hooks
Write-Status "Installing pre-commit hooks..."
try {
    pre-commit install
    Write-Success "Pre-commit hooks installed"
} catch {
    Write-Error "Failed to install pre-commit hooks"
    exit 1
}

# Install pre-push hooks
Write-Status "Installing pre-push hooks..."
try {
    pre-commit install --hook-type pre-push
    Write-Success "Pre-push hooks installed"
} catch {
    Write-Warning "Failed to install pre-push hooks"
}

# Check for Node.js
Write-Status "Checking for Node.js..."
try {
    $nodeVersion = node --version 2>&1
    Write-Success "Node.js found: $nodeVersion"
} catch {
    Write-Error "Node.js not found. Please install Node.js from https://nodejs.org"
    exit 1
}

# Install frontend dependencies
Write-Status "Installing frontend dependencies..."
Set-Location frontend
if (-not (Test-Path "node_modules") -or $Force) {
    try {
        npm install
        Write-Success "Frontend dependencies installed"
    } catch {
        Write-Error "Failed to install frontend dependencies"
        Set-Location ..
        exit 1
    }
} else {
    Write-Success "Frontend dependencies already installed"
}
Set-Location ..

# Check for UV (Python package manager)
Write-Status "Checking for UV..."
try {
    $uvVersion = uv --version 2>&1
    Write-Success "UV found: $uvVersion"
} catch {
    Write-Status "Installing UV..."
    try {
        # Download and install UV for Windows
        Invoke-WebRequest -Uri "https://astral.sh/uv/install.ps1" -OutFile "install-uv.ps1"
        PowerShell -ExecutionPolicy Bypass -File "install-uv.ps1"
        Remove-Item "install-uv.ps1"

        # Add UV to PATH for current session
        $env:PATH += ";$env:USERPROFILE\.cargo\bin"
        Write-Success "UV installed successfully"
    } catch {
        Write-Warning "Failed to install UV. Falling back to pip for Python dependencies."
    }
}

# Install Python dependencies
Write-Status "Installing Python dependencies..."
Set-Location backend/src-python
if (-not (Test-Path ".venv") -or $Force) {
    try {
        if (Get-Command uv -ErrorAction SilentlyContinue) {
            uv sync --dev
        } else {
            # Fallback to pip
            python -m venv .venv
            .\.venv\Scripts\Activate.ps1
            pip install -e ".[dev]"
        }
        Write-Success "Python dependencies installed"
    } catch {
        Write-Error "Failed to install Python dependencies"
        Set-Location ..\..
        exit 1
    }
} else {
    Write-Success "Python dependencies already installed"
}
Set-Location ..\..

# Check for Rust
Write-Status "Checking for Rust..."
try {
    $rustVersion = cargo --version 2>&1
    Write-Success "Rust found: $rustVersion"

    # Install Rust components
    Write-Status "Installing Rust components..."
    rustup component add rustfmt clippy
    Write-Success "Rust components installed"
} catch {
    Write-Warning "Rust not found. Please install Rust from https://rustup.rs/"
    Write-Warning "Rust-related hooks will be skipped until Rust is installed."
}

# Run initial validation
Write-Status "Running initial validation..."
Write-Host ""
Write-Host "🔍 Running pre-commit on all files..." -ForegroundColor $Blue

try {
    pre-commit run --all-files
    Write-Success "All pre-commit hooks passed!"
} catch {
    Write-Warning "Some pre-commit hooks failed. Please fix the issues and try again."
    Write-Host ""
    Write-Host "Common fixes:" -ForegroundColor $Yellow
    Write-Host "  - Frontend formatting: npm run format"
    Write-Host "  - Python formatting: cd src-python; uv run black .; uv run isort ."
    Write-Host "  - Rust formatting: cd src-tauri; cargo fmt --all"
}

Write-Host ""
Write-Success "Development environment setup complete!"
Write-Host ""
Write-Host "📋 Available commands:" -ForegroundColor $Blue
Write-Host "  - Run all hooks: pre-commit run --all-files"
Write-Host "  - Update hooks: pre-commit autoupdate"
Write-Host "  - Skip hooks (not recommended): git commit --no-verify"
Write-Host ""
Write-Host "Fix commands:" -ForegroundColor $Yellow
Write-Host "  - Frontend: npm run format; npm run lint --fix"
Write-Host "  - Python: cd src-python; uv run black .; uv run isort ."
Write-Host "  - Rust: cd src-tauri; cargo fmt --all"
Write-Host ""
Write-Host "Happy coding!" -ForegroundColor $Green
