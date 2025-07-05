# Branch Protection Configuration

This document describes the recommended branch protection rules for the eFlow repository.

## Main Branch Protection

Configure the following settings for the `main` branch in GitHub repository settings:

### Required Status Checks
- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging

**Required checks:**
- `Frontend Quality Checks`
- `Python Backend Quality Checks`
- `Rust Backend Quality Checks`
- `Security Audit`
- `Integration Tests`
- `Validate Pull Request`

### Pull Request Requirements
- ✅ Require a pull request before merging
- ✅ Require approvals: **2**
- ✅ Dismiss stale reviews when new commits are pushed
- ✅ Require review from code owners (if CODEOWNERS file exists)
- ✅ Restrict pushes that create files that change the code owner

### Additional Restrictions
- ✅ Restrict pushes to matching branches
- ✅ Allow force pushes: **❌ Disabled**
- ✅ Allow deletions: **❌ Disabled**

## Develop Branch Protection

Configure the following settings for the `develop` branch:

### Required Status Checks
- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging

**Required checks:**
- `Frontend Quality Checks`
- `Python Backend Quality Checks`
- `Rust Backend Quality Checks`
- `Security Audit`

### Pull Request Requirements
- ✅ Require a pull request before merging
- ✅ Require approvals: **1**
- ✅ Dismiss stale reviews when new commits are pushed

## Setup Instructions

### 1. Automatic Setup (Recommended)

Use the GitHub CLI to set up branch protection rules:

```bash
# Install GitHub CLI if not already installed
# https://cli.github.com/

# Login to GitHub
gh auth login

# Set up main branch protection
gh api repos/:owner/:repo/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["Frontend Quality Checks","Python Backend Quality Checks","Rust Backend Quality Checks","Security Audit","Integration Tests","Validate Pull Request"]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":2,"dismiss_stale_reviews":true,"require_code_owner_reviews":true}' \
  --field restrictions=null

# Set up develop branch protection
gh api repos/:owner/:repo/branches/develop/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["Frontend Quality Checks","Python Backend Quality Checks","Rust Backend Quality Checks","Security Audit"]}' \
  --field enforce_admins=false \
  --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true}' \
  --field restrictions=null
```

### 2. Manual Setup

1. Go to your repository on GitHub
2. Click on **Settings** tab
3. Click on **Branches** in the left sidebar
4. Click **Add rule** for each branch
5. Configure the settings as described above

## Code Owners (Optional)

Create a `.github/CODEOWNERS` file to automatically request reviews from specific team members:

```
# Global owners
* @team-lead @senior-dev

# Frontend specific
frontend/ @frontend-team @ui-ux-team

# Python backend
backend/src-python/ @backend-team @python-experts

# Rust backend
backend/src-tauri/ @backend-team @rust-experts

# CI/CD and workflows
.github/ @devops-team @team-lead

# Documentation
docs/ @tech-writers @team-lead
*.md @tech-writers
```

## Workflow Integration

The branch protection rules work in conjunction with:

1. **GitHub Actions workflows** (`.github/workflows/`)
2. **Pre-commit hooks** (`.pre-commit-config.yaml`)
3. **Development setup scripts** (`scripts/`)

## Troubleshooting

### Common Issues

1. **Status checks not appearing**
   - Ensure workflows have run at least once
   - Check workflow names match exactly
   - Verify workflows are enabled

2. **Required reviews not enforced**
   - Check if user has admin privileges (admins can bypass)
   - Verify "Enforce for administrators" is enabled

3. **Pre-commit hooks not running**
   - Run `scripts/setup-hooks.sh` or `scripts/setup-hooks.ps1`
   - Check if hooks are installed: `pre-commit --version`

### Emergency Bypass

In case of emergency, repository administrators can:

1. Temporarily disable branch protection
2. Make necessary changes
3. Re-enable protection rules
4. Document the bypass in commit message

**Note:** Emergency bypasses should be rare and well-documented.
