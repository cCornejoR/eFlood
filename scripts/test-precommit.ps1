# Script para probar pre-commit localmente
# Solo detecta errores criticos que rompen la compilacion

Write-Host "Probando configuracion de pre-commit (solo errores criticos)..." -ForegroundColor Cyan
Write-Host ""

$ErrorCount = 0

# Test Frontend TypeScript
Write-Host "Verificando TypeScript..." -ForegroundColor Yellow
try {
    npm run type-check 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "OK TypeScript: Sin errores criticos" -ForegroundColor Green
    } else {
        Write-Host "ERROR TypeScript: Errores de compilacion encontrados" -ForegroundColor Red
        $ErrorCount++
    }
} catch {
    Write-Host "ERROR TypeScript: Error al ejecutar verificacion" -ForegroundColor Red
    $ErrorCount++
}

# Test Python Syntax
Write-Host "Verificando sintaxis Python..." -ForegroundColor Yellow
try {
    Push-Location src-python
    $pythonFiles = Get-ChildItem -Name "*.py" | Select-Object -First 20
    if ($pythonFiles) {
        python -m py_compile $pythonFiles 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "OK Python: Sin errores de sintaxis" -ForegroundColor Green
        } else {
            Write-Host "ERROR Python: Errores de sintaxis encontrados" -ForegroundColor Red
            $ErrorCount++
        }
    } else {
        Write-Host "WARN Python: No se encontraron archivos .py" -ForegroundColor Yellow
    }
    Pop-Location
} catch {
    Write-Host "ERROR Python: Error al ejecutar verificacion" -ForegroundColor Red
    $ErrorCount++
    Pop-Location
}

# Test Rust Compilation
Write-Host "Verificando compilacion Rust..." -ForegroundColor Yellow
try {
    Push-Location src-tauri
    cargo check --quiet --message-format=short 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "OK Rust: Sin errores de compilacion" -ForegroundColor Green
    } else {
        Write-Host "ERROR Rust: Errores de compilacion encontrados" -ForegroundColor Red
        $ErrorCount++
    }
    Pop-Location
} catch {
    Write-Host "ERROR Rust: Error al ejecutar verificacion" -ForegroundColor Red
    $ErrorCount++
    Pop-Location
}

Write-Host ""
Write-Host "Resumen:" -ForegroundColor Cyan

if ($ErrorCount -eq 0) {
    Write-Host "EXITO: Todas las verificaciones criticas pasaron!" -ForegroundColor Green
    Write-Host "OK: El commit puede proceder sin problemas" -ForegroundColor Green
    Write-Host ""
    Write-Host "INFO: Para analisis completo de warnings: npm run analyze:warnings" -ForegroundColor Blue
    exit 0
} else {
    Write-Host "ERROR: Se encontraron $ErrorCount errores criticos" -ForegroundColor Red
    Write-Host "BLOCK: El commit sera bloqueado hasta que se corrijan" -ForegroundColor Red
    Write-Host ""
    Write-Host "INFO: Solo se verifican errores que rompen la compilacion" -ForegroundColor Blue
    Write-Host "INFO: Los warnings no bloquean el commit" -ForegroundColor Blue
    exit 1
}
