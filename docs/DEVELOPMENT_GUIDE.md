# eFlow Development Guide

## Getting Started

### Prerequisites

Before you begin development, ensure you have the following installed:

- **Node.js 18+** and **npm**
- **Rust 1.70+** with Cargo
- **Python 3.11+**
- **UV package manager** for Python
- **Git** for version control

### Initial Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd eflow
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Set up Python environment**
   ```bash
   cd src-python
   uv sync --extra dev
   cd ..
   ```

4. **Verify Rust installation**
   ```bash
   cd src-tauri
   cargo check
   cd ..
   ```

## Development Workflow

### Frontend Development

#### Starting the Development Server
```bash
npm run dev          # Start Vite dev server (port 5173)
npm run tauri dev    # Start Tauri app with hot reload
```

#### Code Quality
```bash
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues automatically
npm run format       # Format code with Prettier
npm run type-check   # TypeScript type checking
```

#### Building
```bash
npm run build        # Build for production
npm run preview      # Preview production build
```

### Backend Development (Python)

#### Environment Management
```bash
cd src-python
uv sync              # Install/update dependencies
uv add <package>     # Add new dependency
uv remove <package>  # Remove dependency
```

#### Code Quality
```bash
uv run black .       # Format code with Black
uv run isort .       # Sort imports
uv run flake8 .      # Lint code
uv run mypy .        # Type checking
```

#### Testing
```bash
uv run pytest                    # Run all tests
uv run pytest -v                 # Verbose output
uv run pytest --cov=.           # With coverage
uv run pytest tests/test_*.py   # Specific test file
```

#### Running Individual Modules
```bash
uv run python hdf_reader.py <file.hdf> structure
uv run python hydraulic_calc.py normal 100 0.001 0.03 10
uv run python geometry_tools.py spline points.json
```

### Rust Development

#### Development Commands
```bash
cd src-tauri
cargo check          # Quick compilation check
cargo build          # Build debug version
cargo build --release # Build optimized version
cargo test           # Run tests
cargo clippy         # Linting
cargo fmt            # Format code
```

#### Tauri-Specific Commands
```bash
npm run tauri dev     # Development mode with hot reload
npm run tauri build   # Build desktop application
npm run tauri info    # System information
```

## Project Structure

```
eflow/
├── src/                     # React frontend
│   ├── components/          # React components
│   ├── utils/              # Utility functions
│   ├── App.tsx             # Main app component
│   └── main.tsx            # Entry point
├── src-tauri/              # Rust/Tauri backend
│   ├── src/
│   │   ├── lib.rs          # Tauri commands
│   │   └── main.rs         # App entry point
│   ├── Cargo.toml          # Rust dependencies
│   └── tauri.conf.json     # Tauri configuration
├── src-python/             # Python scientific backend
│   ├── *.py               # Python modules
│   └── pyproject.toml     # Python dependencies
├── tests/                  # Integration tests
├── docs/                   # Documentation
└── package.json           # Node.js dependencies
```

## Adding New Features

### 1. Adding a New React Component

```typescript
// src/components/NewComponent.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../utils/cn';

interface NewComponentProps {
  // Define props
}

const NewComponent: React.FC<NewComponentProps> = ({ /* props */ }) => {
  const [state, setState] = useState();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn("base-classes")}
    >
      {/* Component content */}
    </motion.div>
  );
};

export default NewComponent;
```

### 2. Adding a New Tauri Command

```rust
// src-tauri/src/lib.rs
#[tauri::command]
async fn new_command(param1: String, param2: f64) -> Result<PythonResult, String> {
    let args = vec![
        "command_name".to_string(),
        param1,
        param2.to_string(),
    ];
    let result = execute_python_script("module_name.py", args);
    Ok(result)
}

// Add to invoke_handler in run() function
.invoke_handler(tauri::generate_handler![
    // ... existing commands
    new_command
])
```

### 3. Adding a New Python Module

```python
# src-python/new_module.py
"""
New Module Description
"""

import json
import sys
from typing import Dict, Any


class NewClass:
    """Class description"""

    def __init__(self):
        """Initialize the class"""
        pass

    def new_method(self, param: str) -> Dict[str, Any]:
        """Method description"""
        return {"result": param}


def main():
    """Command line interface"""
    if len(sys.argv) < 2:
        print("Usage: python new_module.py <command> [args...]")
        sys.exit(1)

    command = sys.argv[1]

    try:
        instance = NewClass()

        if command == 'new_command':
            result = instance.new_method(sys.argv[2])
            print(json.dumps(result, indent=2))
        else:
            print(f"Unknown command: {command}")
            sys.exit(1)

    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
```

## Testing Guidelines

### Frontend Testing

```typescript
// src/components/__tests__/Component.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import Component from '../Component';

describe('Component', () => {
  test('renders correctly', () => {
    render(<Component />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  test('handles user interaction', () => {
    render(<Component />);
    fireEvent.click(screen.getByRole('button'));
    // Assert expected behavior
  });
});
```

### Python Testing

```python
# src-python/tests/test_module.py
import unittest
from module_name import ClassName


class TestClassName(unittest.TestCase):
    def setUp(self):
        self.instance = ClassName()

    def test_method(self):
        result = self.instance.method("test_input")
        self.assertEqual(result["expected_key"], "expected_value")

    def test_error_handling(self):
        with self.assertRaises(ValueError):
            self.instance.method(None)


if __name__ == "__main__":
    unittest.main()
```

### Integration Testing

```python
# tests/test_integration.py
import subprocess
import json


def test_command_integration():
    result = subprocess.run([
        "uv", "run", "python", "module.py", "command", "arg"
    ], cwd="src-python", capture_output=True, text=True)

    assert result.returncode == 0
    data = json.loads(result.stdout)
    assert "expected_key" in data
```

## Debugging

### VS Code Configuration

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Tauri Development",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/tauri",
      "args": ["dev"],
      "console": "integratedTerminal"
    },
    {
      "name": "Python Module",
      "type": "python",
      "request": "launch",
      "program": "${workspaceFolder}/backend-python/module.py",
      "args": ["command", "arg"],
      "console": "integratedTerminal",
      "cwd": "${workspaceFolder}/src-python"
    }
  ]
}
```

### Debugging Tips

1. **Frontend**: Use browser dev tools with React DevTools extension
2. **Rust**: Use `println!` or `dbg!` macros for debugging
3. **Python**: Use `print()` statements or `pdb` debugger
4. **Integration**: Check console logs in all three layers

## Performance Optimization

### Frontend
- Use React.memo for expensive components
- Implement virtual scrolling for large lists
- Debounce user inputs
- Lazy load components

### Rust
- Use async/await for I/O operations
- Minimize data copying between layers
- Use efficient data structures
- Profile with `cargo flamegraph`

### Python
- Use NumPy for numerical computations
- Implement caching for expensive operations
- Use generators for large datasets
- Profile with `cProfile`

## Deployment

### Development Build
```bash
npm run tauri dev
```

### Production Build
```bash
npm run tauri build
```

This creates platform-specific installers in `src-tauri/target/release/bundle/`.

### Cross-Platform Builds
- **Windows**: `.msi` installer
- **macOS**: `.dmg` package
- **Linux**: `.deb` and `.rpm` packages

## Contributing Guidelines

1. **Code Style**: Follow established formatting rules
2. **Testing**: Add tests for new features
3. **Documentation**: Update docs for API changes
4. **Commits**: Use conventional commit messages
5. **Pull Requests**: Include description and testing notes

## Troubleshooting

### Common Issues

1. **Python module not found**: Run `uv sync` in src-python
2. **Rust compilation errors**: Run `cargo clean` and rebuild
3. **Frontend build fails**: Clear node_modules and reinstall
4. **Tauri dev mode issues**: Check tauri.conf.json configuration

### Getting Help

- Check the documentation in `docs/`
- Review existing tests for examples
- Use the debugging configurations
- Check GitHub issues for known problems

This guide should help you get started with eFlow development and maintain code quality throughout the project.
