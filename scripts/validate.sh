#!/bin/bash

# eFlow - Local Validation Script
# This script runs all validation checks locally before committing

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
TOTAL_ERRORS=0
TOTAL_WARNINGS=0

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

print_section() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE} $1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

echo "🔍 Running eFlow validation checks..."

# Frontend validation
print_section "Frontend Validation"

cd frontend

print_status "Running TypeScript type checking..."
if npm run type-check; then
    print_success "TypeScript type checking passed"
else
    print_error "TypeScript type checking failed"
    TOTAL_ERRORS=$((TOTAL_ERRORS + 1))
fi

print_status "Running ESLint..."
if npm run lint; then
    print_success "ESLint passed"
else
    print_error "ESLint failed"
    print_warning "Run 'npm run lint:fix' to auto-fix some issues"
    TOTAL_ERRORS=$((TOTAL_ERRORS + 1))
fi

print_status "Checking code formatting..."
if npm run format:check; then
    print_success "Code formatting is correct"
else
    print_error "Code formatting issues found"
    print_warning "Run 'npm run format' to fix formatting"
    TOTAL_ERRORS=$((TOTAL_ERRORS + 1))
fi

print_status "Running tests..."
if npm run test -- --run; then
    print_success "All tests passed"
else
    print_error "Some tests failed"
    TOTAL_ERRORS=$((TOTAL_ERRORS + 1))
fi

print_status "Testing build..."
if npm run build; then
    print_success "Build successful"
else
    print_error "Build failed"
    TOTAL_ERRORS=$((TOTAL_ERRORS + 1))
fi

cd ..

# Python validation
print_section "Python Backend Validation"

cd backend/src-python

if command -v uv &> /dev/null; then
    print_status "Running Python linting (flake8)..."
    if uv run flake8 .; then
        print_success "Python linting passed"
    else
        print_error "Python linting failed"
        TOTAL_ERRORS=$((TOTAL_ERRORS + 1))
    fi

    print_status "Checking Python formatting (black)..."
    if uv run black --check .; then
        print_success "Python formatting is correct"
    else
        print_error "Python formatting issues found"
        print_warning "Run 'uv run black .' to fix formatting"
        TOTAL_ERRORS=$((TOTAL_ERRORS + 1))
    fi

    print_status "Checking import sorting (isort)..."
    if uv run isort --check-only .; then
        print_success "Import sorting is correct"
    else
        print_error "Import sorting issues found"
        print_warning "Run 'uv run isort .' to fix imports"
        TOTAL_ERRORS=$((TOTAL_ERRORS + 1))
    fi

    print_status "Running type checking (mypy)..."
    if uv run mypy .; then
        print_success "Python type checking passed"
    else
        print_warning "Python type checking issues found"
        TOTAL_WARNINGS=$((TOTAL_WARNINGS + 1))
    fi

    print_status "Running Python tests..."
    if uv run pytest; then
        print_success "Python tests passed"
    else
        print_error "Python tests failed"
        TOTAL_ERRORS=$((TOTAL_ERRORS + 1))
    fi
else
    print_warning "UV not found, skipping Python validation"
    print_warning "Install UV from https://github.com/astral-sh/uv"
fi

cd ../..

# Rust validation
print_section "Rust Backend Validation"

cd backend/src-tauri

if command -v cargo &> /dev/null; then
    print_status "Checking Rust formatting..."
    if cargo fmt --all -- --check; then
        print_success "Rust formatting is correct"
    else
        print_error "Rust formatting issues found"
        print_warning "Run 'cargo fmt --all' to fix formatting"
        TOTAL_ERRORS=$((TOTAL_ERRORS + 1))
    fi

    print_status "Running Clippy linting..."
    if cargo clippy --all-targets --all-features -- -D warnings; then
        print_success "Clippy linting passed"
    else
        print_warning "Clippy warnings found"
        TOTAL_WARNINGS=$((TOTAL_WARNINGS + 1))
    fi

    print_status "Running Rust tests..."
    if cargo test; then
        print_success "Rust tests passed"
    else
        print_error "Rust tests failed"
        TOTAL_ERRORS=$((TOTAL_ERRORS + 1))
    fi

    print_status "Testing Rust build..."
    if cargo build; then
        print_success "Rust build successful"
    else
        print_error "Rust build failed"
        TOTAL_ERRORS=$((TOTAL_ERRORS + 1))
    fi
else
    print_warning "Cargo not found, skipping Rust validation"
    print_warning "Install Rust from https://rustup.rs/"
fi

cd ../..

# Security audit
print_section "Security Audit"

print_status "Running npm security audit..."
cd frontend
if npm audit --audit-level=moderate; then
    print_success "No security vulnerabilities found"
else
    print_warning "Security vulnerabilities found"
    print_warning "Run 'npm audit fix' to fix automatically"
    TOTAL_WARNINGS=$((TOTAL_WARNINGS + 1))
fi
cd ..

# Final summary
print_section "Validation Summary"

echo "Total Errors: $TOTAL_ERRORS"
echo "Total Warnings: $TOTAL_WARNINGS"
echo ""

if [ $TOTAL_ERRORS -eq 0 ]; then
    print_success "🎉 All critical validations passed! Ready to commit."
    echo ""
    echo "💡 Quick fix commands:"
    echo "  - Format all: npm run validate:fix (in frontend/)"
    echo "  - Python format: uv run black . && uv run isort . (in backend/src-python/)"
    echo "  - Rust format: cargo fmt --all (in backend/src-tauri/)"
    exit 0
else
    print_error "❌ Validation failed with $TOTAL_ERRORS errors"
    echo ""
    echo "🔧 Fix commands:"
    echo "  - Frontend: cd frontend && npm run validate:fix"
    echo "  - Python: cd backend/src-python && uv run black . && uv run isort ."
    echo "  - Rust: cd backend/src-tauri && cargo fmt --all"
    exit 1
fi
