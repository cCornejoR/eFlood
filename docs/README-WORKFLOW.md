# 🔄 eFlow Automated Workflow System

## 🚀 Quick Setup

### For Developers (First Time Setup)

**Windows:**
```powershell
# Run as Administrator if needed
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\scripts\setup-hooks.ps1
```

**Linux/macOS:**
```bash
./scripts/setup-hooks.sh
```

### Daily Development Workflow

1. **Before committing:**
   ```bash
   # Windows
   .\scripts\validate.ps1

   # Linux/macOS
   ./scripts/validate.sh
   ```

2. **Auto-fix common issues:**
   ```bash
   # Windows
   .\scripts\validate.ps1 -Fix

   # Linux/macOS
   ./scripts/validate.sh --fix
   ```

3. **Commit your changes:**
   ```bash
   git add .
   git commit -m "Your commit message"
   # Pre-commit hooks run automatically
   ```

## 🛡️ Protection Layers

### ✅ What Gets Validated

| Component | Checks | Auto-Fix Available |
|-----------|--------|-------------------|
| **Frontend** | TypeScript, ESLint, Prettier, Tests, Build | ✅ |
| **Python** | Black, isort, Flake8, MyPy, Tests | ✅ |
| **Rust** | rustfmt, Clippy, Tests, Build | ✅ |
| **Security** | Dependency audit, Secret scanning | ⚠️ |
| **General** | File formatting, Large files, Merge conflicts | ✅ |

### 🔒 When Validation Runs

1. **Pre-commit** - Before each `git commit`
2. **Pre-push** - Before each `git push`
3. **GitHub Actions** - On every push/PR
4. **PR Validation** - Detailed reports on pull requests
5. **Manual** - When you run validation scripts

## 🚨 Error Handling

### Common Errors and Quick Fixes

#### ❌ TypeScript Errors
```bash
cd frontend
npm run type-check
# Fix the reported type issues
```

#### ❌ Linting Errors
```bash
cd frontend
npm run lint:fix  # Auto-fix many issues
```

#### ❌ Formatting Issues
```bash
# Frontend
cd frontend && npm run format

# Python
cd backend/src-python && uv run black . && uv run isort .

# Rust
cd backend/src-tauri && cargo fmt --all
```

#### ❌ Test Failures
```bash
# Frontend
cd frontend && npm run test

# Python
cd backend/src-python && uv run pytest -v

# Rust
cd backend/src-tauri && cargo test
```

## 📊 Validation Report Example

When you run validation, you'll see a detailed report:

```
🔍 Running eFlow validation checks...

========================================
 Frontend Validation
========================================
[INFO] Running TypeScript type checking...
✅ [SUCCESS] TypeScript type checking passed
[INFO] Running ESLint...
❌ [ERROR] ESLint failed
[WARNING] Run 'npm run lint:fix' to auto-fix some issues

========================================
 Validation Summary
========================================
Total Errors: 1
Total Warnings: 0

❌ Validation failed with 1 errors
🔧 Fix commands:
  - Frontend: cd frontend && npm run validate:fix
```

## 🔧 Available Commands

### Frontend Commands
```bash
cd frontend

# Development
npm run dev              # Start dev server
npm run build           # Build for production

# Validation
npm run type-check      # TypeScript checking
npm run lint            # ESLint linting
npm run lint:fix        # Auto-fix linting issues
npm run format          # Format code with Prettier
npm run format:check    # Check formatting
npm run test            # Run tests
npm run validate        # Run all checks
npm run validate:fix    # Auto-fix issues
```

### Python Commands
```bash
cd backend/src-python

# Formatting
uv run black .          # Format code
uv run isort .          # Sort imports

# Validation
uv run flake8 .         # Lint code
uv run mypy .           # Type checking
uv run pytest          # Run tests
```

### Rust Commands
```bash
cd backend/src-tauri

# Formatting
cargo fmt --all        # Format code

# Validation
cargo clippy --all-targets --all-features  # Lint
cargo test             # Run tests
cargo build            # Build project
```

## 🚫 Bypassing Validation (Emergency Only)

```bash
# Skip pre-commit hooks (NOT RECOMMENDED)
git commit --no-verify

# Skip pre-push hooks (NOT RECOMMENDED)
git push --no-verify
```

**⚠️ Warning:** Only use in emergencies and document why!

## 📁 File Structure

```
.github/
├── workflows/
│   ├── ci.yml                 # Main CI/CD pipeline
│   └── pr-validation.yml      # PR validation with reports
└── branch-protection.md       # Branch protection setup

scripts/
├── setup-hooks.sh            # Linux/macOS setup
├── setup-hooks.ps1           # Windows setup
├── validate.sh               # Linux/macOS validation
└── validate.ps1              # Windows validation

docs/
└── WORKFLOW_AUTOMATION.md    # Detailed documentation

.pre-commit-config.yaml        # Pre-commit configuration
```

## 🔍 Monitoring

### GitHub Actions
- Check the "Actions" tab in your GitHub repository
- All workflows must pass before merging
- Detailed logs available for debugging

### Local Validation
- Run `validate` scripts before committing
- Check coverage reports in respective directories
- Monitor security audit results

## 🆘 Troubleshooting

### Setup Issues

1. **Pre-commit not working:**
   ```bash
   pre-commit clean
   pre-commit install --install-hooks
   ```

2. **Python/UV issues:**
   ```bash
   # Install UV
   curl -LsSf https://astral.sh/uv/install.sh | sh  # Linux/macOS
   # Or download from https://github.com/astral-sh/uv for Windows
   ```

3. **Node.js issues:**
   ```bash
   # Install Node.js 18+ from https://nodejs.org
   cd frontend && npm install
   ```

4. **Rust issues:**
   ```bash
   # Install Rust from https://rustup.rs
   rustup component add rustfmt clippy
   ```

### Validation Failures

1. **Read the error messages carefully** - they contain specific fix instructions
2. **Use auto-fix commands** when available
3. **Run validation locally** before pushing
4. **Check GitHub Actions logs** for CI failures

## 🎯 Best Practices

1. ✅ **Run validation before committing**
2. ✅ **Fix issues incrementally**
3. ✅ **Use auto-fix commands**
4. ✅ **Write tests for new features**
5. ✅ **Keep dependencies updated**
6. ✅ **Monitor security audits**
7. ❌ **Don't bypass validation without good reason**
8. ❌ **Don't commit broken code**

## 📚 Additional Resources

- [Detailed Workflow Documentation](docs/WORKFLOW_AUTOMATION.md)
- [Branch Protection Setup](.github/branch-protection.md)
- [Pre-commit Documentation](https://pre-commit.com/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

---

**🎉 Happy coding with automated quality assurance!**
