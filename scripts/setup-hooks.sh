#!/bin/bash

# eFlow - Setup Development Hooks
# This script sets up pre-commit hooks and development environment

set -e

echo "🚀 Setting up eFlow development environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Install pre-commit if not already installed
print_status "Checking for pre-commit..."
if ! command -v pre-commit &> /dev/null; then
    print_status "Installing pre-commit..."
    if command -v pip &> /dev/null; then
        pip install pre-commit
    elif command -v pip3 &> /dev/null; then
        pip3 install pre-commit
    else
        print_error "pip not found. Please install Python and pip first."
        exit 1
    fi
else
    print_success "pre-commit is already installed"
fi

# Install pre-commit hooks
print_status "Installing pre-commit hooks..."
pre-commit install

# Install pre-push hooks
print_status "Installing pre-push hooks..."
pre-commit install --hook-type pre-push

# Install frontend dependencies
print_status "Installing frontend dependencies..."
cd frontend
if [ ! -d "node_modules" ]; then
    npm install
else
    print_success "Frontend dependencies already installed"
fi
cd ..

# Install Python dependencies
print_status "Installing Python dependencies..."
cd backend/src-python
if ! command -v uv &> /dev/null; then
    print_status "Installing uv..."
    curl -LsSf https://astral.sh/uv/install.sh | sh
    export PATH="$HOME/.cargo/bin:$PATH"
fi

if [ ! -d ".venv" ]; then
    uv sync --dev
else
    print_success "Python dependencies already installed"
fi
cd ../..

# Check Rust installation
print_status "Checking Rust installation..."
if ! command -v cargo &> /dev/null; then
    print_warning "Rust not found. Please install Rust from https://rustup.rs/"
else
    print_success "Rust is installed"

    # Install Rust components
    print_status "Installing Rust components..."
    rustup component add rustfmt clippy
fi

# Run initial validation
print_status "Running initial validation..."
echo ""
echo "🔍 Running pre-commit on all files..."
if pre-commit run --all-files; then
    print_success "All pre-commit hooks passed!"
else
    print_warning "Some pre-commit hooks failed. Please fix the issues and try again."
    echo ""
    echo "💡 Common fixes:"
    echo "  - Frontend formatting: cd frontend && npm run format"
    echo "  - Python formatting: cd backend/src-python && uv run black . && uv run isort ."
    echo "  - Rust formatting: cd backend/src-tauri && cargo fmt --all"
fi

echo ""
print_success "Development environment setup complete!"
echo ""
echo "📋 Available commands:"
echo "  - Run all hooks: pre-commit run --all-files"
echo "  - Update hooks: pre-commit autoupdate"
echo "  - Skip hooks (not recommended): git commit --no-verify"
echo ""
echo "🔧 Fix commands:"
echo "  - Frontend: cd frontend && npm run format && npm run lint --fix"
echo "  - Python: cd backend/src-python && uv run black . && uv run isort ."
echo "  - Rust: cd backend/src-tauri && cargo fmt --all"
echo ""
echo "🎉 Happy coding!"
