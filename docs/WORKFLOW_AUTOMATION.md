# Workflow Automation Guide

This document describes the automated workflow system for the eFlow project, including pre-commit hooks, GitHub Actions, and validation processes.

## Overview

The eFlow project uses a multi-layered validation approach to ensure code quality:

1. **Local Pre-commit Hooks** - Run before each commit
2. **GitHub Actions CI/CD** - Run on push and pull requests
3. **Branch Protection Rules** - Enforce validation before merging
4. **Manual Validation Scripts** - For local testing

## Quick Start

### 1. Setup Development Environment

**Linux/macOS:**
```bash
./scripts/setup-hooks.sh
```

**Windows:**
```powershell
.\scripts\setup-hooks.ps1
```

### 2. Run Local Validation

**Linux/macOS:**
```bash
./scripts/validate.sh
```

**Windows:**
```powershell
.\scripts\validate.ps1
```

**Auto-fix issues:**
```powershell
.\scripts\validate.ps1 -Fix
```

## Validation Layers

### Layer 1: Pre-commit Hooks

Automatically run before each commit:

- **Frontend:**
  - TypeScript type checking
  - ESLint linting
  - Prettier formatting check
  - Build test

- **Python Backend:**
  - Black code formatting
  - isort import sorting
  - Flake8 linting
  - MyPy type checking
  - Pytest unit tests

- **Rust Backend:**
  - rustfmt formatting
  - Clippy linting
  - Cargo tests

- **General:**
  - Trailing whitespace removal
  - End-of-file fixing
  - YAML/JSON/TOML validation
  - Large file detection
  - Private key detection
  - Secret scanning (GitGuardian)

### Layer 2: GitHub Actions

#### Continuous Integration (`ci.yml`)

Runs on every push and pull request:

1. **Frontend Quality Checks**
   - Node.js setup and dependency installation
   - TypeScript compilation
   - ESLint linting
   - Prettier formatting check
   - Unit tests with coverage
   - Build verification

2. **Python Backend Quality Checks**
   - Python 3.11 setup
   - UV package manager installation
   - Dependency installation
   - Flake8 linting
   - Black formatting check
   - isort import sorting check
   - MyPy type checking
   - Pytest with coverage

3. **Rust Backend Quality Checks**
   - Rust toolchain setup
   - Dependency caching
   - rustfmt formatting check
   - Clippy linting
   - Unit tests
   - Release build

4. **Security Audit**
   - npm audit for Node.js dependencies
   - cargo audit for Rust dependencies

5. **Integration Tests**
   - Cross-component testing
   - End-to-end validation

#### Pull Request Validation (`pr-validation.yml`)

Enhanced validation for pull requests:

- Comprehensive validation report
- Detailed error messages with fix suggestions
- Automatic PR comments with results
- Blocks merge if critical errors found

### Layer 3: Branch Protection

Configured via `.github/branch-protection.md`:

- **Main Branch:**
  - Requires 2 approvals
  - All status checks must pass
  - No force pushes allowed
  - Stale reviews dismissed on new commits

- **Develop Branch:**
  - Requires 1 approval
  - All status checks must pass
  - More permissive for development

## Validation Commands

### Frontend Commands

```bash
cd frontend

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Formatting
npm run format
npm run format:check

# Testing
npm run test
npm run test:ui
npm run test:coverage

# Complete validation
npm run validate
npm run validate:fix
```

### Python Commands

```bash
cd backend/src-python

# Formatting
uv run black .
uv run black --check .

# Import sorting
uv run isort .
uv run isort --check-only .

# Linting
uv run flake8 .

# Type checking
uv run mypy .

# Testing
uv run pytest
uv run pytest --cov=. --cov-report=html
```

### Rust Commands

```bash
cd backend/src-tauri

# Formatting
cargo fmt --all
cargo fmt --all -- --check

# Linting
cargo clippy --all-targets --all-features
cargo clippy --all-targets --all-features -- -D warnings

# Testing
cargo test

# Building
cargo build
cargo build --release
```

## Error Handling and Reporting

### Detailed Error Reports

The validation system provides:

- **Exact file and line locations** of errors
- **Clear descriptions** of what's wrong
- **Specific fix commands** for each issue
- **Auto-fix suggestions** when available

### Common Issues and Fixes

#### Frontend Issues

```bash
# TypeScript errors
npm run type-check

# Linting errors
npm run lint:fix

# Formatting issues
npm run format

# Test failures
npm run test -- --watch
```

#### Python Issues

```bash
# Formatting issues
uv run black .
uv run isort .

# Linting errors
uv run flake8 .  # Check specific errors

# Type checking issues
uv run mypy .  # Review type annotations
```

#### Rust Issues

```bash
# Formatting issues
cargo fmt --all

# Clippy warnings
cargo clippy --fix --allow-dirty

# Test failures
cargo test -- --nocapture
```

## Bypassing Validations

### Emergency Bypass (Not Recommended)

```bash
# Skip pre-commit hooks
git commit --no-verify

# Skip pre-push hooks
git push --no-verify
```

**Note:** Emergency bypasses should be documented and rare.

### Temporary Disable

```bash
# Disable specific hook
pre-commit uninstall

# Re-enable
pre-commit install
```

## Configuration Files

- `.pre-commit-config.yaml` - Pre-commit hook configuration
- `.github/workflows/ci.yml` - Main CI/CD pipeline
- `.github/workflows/pr-validation.yml` - PR validation
- `frontend/vitest.config.ts` - Frontend test configuration
- `backend/src-python/.flake8` - Python linting configuration
- `backend/src-python/pyproject.toml` - Python project configuration

## Monitoring and Metrics

### Coverage Reports

- **Frontend:** Generated in `frontend/coverage/`
- **Python:** Generated in `backend/src-python/htmlcov/`
- **Rust:** Built-in cargo test coverage

### CI/CD Metrics

Monitor in GitHub Actions:
- Build times
- Test success rates
- Coverage trends
- Security audit results

## Troubleshooting

### Common Setup Issues

1. **Pre-commit not working:**
   ```bash
   pre-commit clean
   pre-commit install --install-hooks
   ```

2. **UV not found:**
   ```bash
   curl -LsSf https://astral.sh/uv/install.sh | sh
   ```

3. **Node.js version issues:**
   ```bash
   nvm use 18  # or install Node.js 18+
   ```

4. **Rust not found:**
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```

### Getting Help

1. Check the validation output for specific error messages
2. Run `./scripts/validate.sh` for detailed local validation
3. Review the GitHub Actions logs for CI failures
4. Consult this documentation for fix commands

## Best Practices

1. **Run validation locally** before pushing
2. **Fix issues incrementally** rather than accumulating them
3. **Use auto-fix commands** when available
4. **Keep dependencies updated** regularly
5. **Monitor security audits** and fix vulnerabilities promptly
6. **Write tests** for new features
7. **Document breaking changes** in commit messages
