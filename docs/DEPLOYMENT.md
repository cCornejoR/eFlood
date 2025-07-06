# eFlow Deployment Guide

## Overview

This guide covers building and deploying the eFlow desktop application across different platforms using Tauri's cross-platform capabilities.

## Prerequisites

### Development Environment
- Node.js 18+ with npm
- Rust 1.70+ with Cargo
- Python 3.11+ with UV package manager
- Platform-specific build tools (see below)

### Platform-Specific Requirements

#### Windows
- Microsoft Visual Studio Build Tools 2019 or later
- Windows 10 SDK
- WiX Toolset 3.11+ (for MSI installer)

#### macOS
- Xcode Command Line Tools
- macOS 10.15+ for building
- Apple Developer account (for code signing)

#### Linux
- GCC or Clang compiler
- GTK 3 development libraries
- WebKit2GTK development libraries

## Build Process

### 1. Prepare the Environment

```bash
# Clone and setup
git clone <repository-url>
cd eflow

# Install dependencies
npm install
cd backend-python && uv sync && cd ..

# Verify setup
npm run tauri info
```

### 2. Development Build

```bash
# Start development server
npm run tauri dev

# This will:
# - Start Vite dev server for React
# - Compile Rust code
# - Launch the desktop application
# - Enable hot reload for development
```

### 3. Production Build

```bash
# Build for production
npm run tauri build

# This creates:
# - Optimized React bundle
# - Compiled Rust binary
# - Platform-specific installer
```

## Platform-Specific Builds

### Windows Deployment

#### Building MSI Installer
```bash
npm run tauri build -- --target x86_64-pc-windows-msvc
```

**Output Location**: `src-tauri/target/release/bundle/msi/`

**Files Created**:
- `eFlood²_1.0.0_x64_en-US.msi` - Main installer
- `eFlood²_1.0.0_x64_en-US.msi.zip` - Compressed installer

#### Configuration
Edit `src-tauri/tauri.conf.json`:

```json
{
  "tauri": {
    "bundle": {
      "windows": {
        "certificateThumbprint": null,
        "digestAlgorithm": "sha256",
        "timestampUrl": "",
        "wix": {
          "language": "en-US",
          "template": "main.wxs"
        }
      }
    }
  }
}
```

### macOS Deployment

#### Building DMG Package
```bash
npm run tauri build -- --target x86_64-apple-darwin
npm run tauri build -- --target aarch64-apple-darwin  # For Apple Silicon
```

**Output Location**: `src-tauri/target/release/bundle/dmg/`

**Files Created**:
- `eFlow_1.0.0_x64.dmg` - Intel Macs
- `eFlow_1.0.0_aarch64.dmg` - Apple Silicon Macs

#### Code Signing (Optional)
```bash
# Set up signing identity
export APPLE_CERTIFICATE="Developer ID Application: Your Name"
export APPLE_CERTIFICATE_PASSWORD="your-password"

# Build with signing
npm run tauri build -- --target universal-apple-darwin
```

### Linux Deployment

#### Building DEB Package
```bash
npm run tauri build -- --target x86_64-unknown-linux-gnu
```

**Output Location**: `src-tauri/target/release/bundle/deb/`

**Files Created**:
- `eflow_1.0.0_amd64.deb` - Debian/Ubuntu package

#### Building RPM Package
```bash
npm run tauri build -- --target x86_64-unknown-linux-gnu
```

**Output Location**: `src-tauri/target/release/bundle/rpm/`

**Files Created**:
- `eflow-1.0.0-1.x86_64.rpm` - Red Hat/Fedora package

#### Building AppImage
```bash
npm run tauri build -- --target x86_64-unknown-linux-gnu
```

**Output Location**: `src-tauri/target/release/bundle/appimage/`

**Files Created**:
- `eflow_1.0.0_amd64.AppImage` - Portable application

## Configuration

### Application Metadata

Edit `src-tauri/tauri.conf.json`:

```json
{
  "package": {
    "productName": "eFlood²",
    "version": "1.0.0"
  },
  "tauri": {
    "bundle": {
      "active": true,
      "targets": "all",
      "identifier": "com.eflow.app",
      "icon": [
        "icons/32x32.png",
        "icons/128x128.png",
        "icons/128x128@2x.png",
        "icons/icon.icns",
        "icons/icon.ico"
      ],
      "resources": [],
      "externalBin": [],
      "copyright": "",
      "category": "DeveloperTool",
      "shortDescription": "",
      "longDescription": ""
    }
  }
}
```

### Security Configuration

```json
{
  "tauri": {
    "allowlist": {
      "all": false,
      "shell": {
        "all": false,
        "open": true
      },
      "dialog": {
        "all": false,
        "open": true,
        "save": true
      }
    },
    "security": {
      "csp": "default-src 'self'; img-src 'self' asset: https://asset.localhost"
    }
  }
}
```

## Continuous Integration

### GitHub Actions Workflow

Create `.github/workflows/build.yml`:

```yaml
name: Build and Release

on:
  push:
    tags: ['v*']
  workflow_dispatch:

jobs:
  build:
    strategy:
      matrix:
        platform: [macos-latest, ubuntu-20.04, windows-latest]

    runs-on: ${{ matrix.platform }}
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'

      - name: Setup Rust
        uses: dtolnay/rust-toolchain@stable

      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'

      - name: Install UV
        run: pip install uv

      - name: Install dependencies
        run: |
          npm install
          cd backend-python && uv sync && cd ..

      - name: Build Tauri app
        run: npm run tauri build

      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: ${{ matrix.platform }}-build
          path: src-tauri/target/release/bundle/
```

## Distribution

### Direct Distribution
- Upload installers to your website
- Provide download links for each platform
- Include installation instructions

### Package Managers

#### Windows (Chocolatey)
```powershell
# Create chocolatey package
choco pack eflow.nuspec
choco push eflow.1.0.0.nupkg
```

#### macOS (Homebrew)
```bash
# Create homebrew formula
brew create https://github.com/your-org/eflow/releases/download/v1.0.0/eflow-macos.tar.gz
```

#### Linux (Snap Store)
```bash
# Create snap package
snapcraft
snapcraft upload eflow_1.0.0_amd64.snap
```

## Auto-Updates

### Configuration
Edit `src-tauri/tauri.conf.json`:

```json
{
  "tauri": {
    "updater": {
      "active": true,
      "endpoints": [
        "https://your-domain.com/updates/{{target}}/{{current_version}}"
      ],
      "dialog": true,
      "pubkey": "your-public-key"
    }
  }
}
```

### Update Server
Set up an update server that provides:
- Version information
- Download URLs for each platform
- Digital signatures for security

## Testing Deployment

### Pre-Release Testing
1. **Smoke Testing**: Verify basic functionality
2. **Platform Testing**: Test on target operating systems
3. **Installation Testing**: Test installer/uninstaller
4. **Update Testing**: Test auto-update mechanism

### Automated Testing
```bash
# Run integration tests
python tests/test_communication_bridge.py

# Test build process
npm run tauri build --debug

# Verify bundle contents
ls -la src-tauri/target/release/bundle/
```

## Troubleshooting

### Common Build Issues

#### Windows
- **Error**: "MSVC not found"
  - **Solution**: Install Visual Studio Build Tools

#### macOS
- **Error**: "Code signing failed"
  - **Solution**: Check Apple Developer account and certificates

#### Linux
- **Error**: "GTK libraries not found"
  - **Solution**: Install development packages
  ```bash
  sudo apt-get install libgtk-3-dev libwebkit2gtk-4.0-dev
  ```

### Performance Optimization
- Use release builds for distribution
- Enable link-time optimization (LTO)
- Strip debug symbols from final binaries
- Compress installers when possible

### Security Considerations
- Sign all executables and installers
- Use HTTPS for update servers
- Validate all external dependencies
- Regular security audits

## Monitoring and Analytics

### Crash Reporting
Integrate crash reporting to monitor application stability:
- Sentry for error tracking
- Custom telemetry for usage analytics
- Performance monitoring

### User Feedback
- In-app feedback mechanisms
- Update notification systems
- Usage statistics collection (with user consent)

This deployment guide ensures reliable, secure distribution of the eFlow application across all supported platforms.
