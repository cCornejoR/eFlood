# 🔍 eFlood² Warning Analyzer - PowerShell Version
# Analiza todo el código del proyecto buscando warnings y los clasifica por criticidad

param(
    [string]$OutputFile = "warnings-report.md",
    [switch]$Verbose = $false,
    [switch]$OnlyCritical = $false
)

Write-Host "🚀 Iniciando análisis de warnings para eFlood²..." -ForegroundColor Cyan
Write-Host ""

# Configuración
$ProjectRoot = Get-Location
$Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$TotalWarnings = 0
$CriticalCount = 0
$HighCount = 0
$MediumCount = 0
$LowCount = 0

# Crear archivo de reporte
$ReportContent = @"
# 🔍 Reporte de Warnings - eFlood²

**Generado**: $Timestamp
**Directorio**: $ProjectRoot

## 📊 Resumen Ejecutivo

"@

# Función para clasificar warnings
function Get-WarningSeverity {
    param([string]$Message)

    # Patrones críticos
    $CriticalPatterns = @(
        "error TS\d+",
        "Cannot find module",
        "Module .* not found",
        "Property .* does not exist",
        "Type .* is not assignable",
        "Object is possibly 'null'",
        "Object is possibly 'undefined'"
    )

    # Patrones altos
    $HighPatterns = @(
        "Unexpected any",
        "no-explicit-any",
        "React Hook .* has missing dependencies",
        "exhaustive-deps",
        "no-unused-vars",
        "declared but its value is never read",
        "Fast refresh only works when"
    )

    # Patrones medios
    $MediumPatterns = @(
        "Missing return type",
        "no-console",
        "prefer-const",
        "no-var",
        "eqeqeq"
    )

    # Patrones bajos
    $LowPatterns = @(
        "prettier/prettier",
        "Delete.*prettier",
        "Insert.*prettier",
        "trailing-whitespace"
    )

    foreach ($pattern in $CriticalPatterns) {
        if ($Message -match $pattern) { return "CRITICAL" }
    }
    foreach ($pattern in $HighPatterns) {
        if ($Message -match $pattern) { return "HIGH" }
    }
    foreach ($pattern in $MediumPatterns) {
        if ($Message -match $pattern) { return "MEDIUM" }
    }
    foreach ($pattern in $LowPatterns) {
        if ($Message -match $pattern) { return "LOW" }
    }
    return "UNKNOWN"
}

# Función para agregar warning al reporte
function Add-WarningToReport {
    param(
        [string]$Severity,
        [string]$File,
        [string]$Line,
        [string]$Message,
        [string]$Source
    )

    $script:TotalWarnings++

    switch ($Severity) {
        "CRITICAL" { $script:CriticalCount++; $Icon = "🔥" }
        "HIGH" { $script:HighCount++; $Icon = "⚠️" }
        "MEDIUM" { $script:MediumCount++; $Icon = "📝" }
        "LOW" { $script:LowCount++; $Icon = "💡" }
        default { $Icon = "❓" }
    }

    if ($OnlyCritical -and $Severity -ne "CRITICAL") {
        return
    }

    $WarningEntry = @"

### $Icon $Severity - $Source
**Archivo**: ``$File``
**Línea**: $Line
**Mensaje**: ``$Message``

"@

    $script:ReportContent += $WarningEntry

    if ($Verbose) {
        Write-Host "$Icon [$Severity] $File:$Line - $Message" -ForegroundColor $(
            switch ($Severity) {
                "CRITICAL" { "Red" }
                "HIGH" { "Yellow" }
                "MEDIUM" { "Cyan" }
                "LOW" { "Gray" }
                default { "White" }
            }
        )
    }
}

# Análisis de TypeScript
Write-Host "🔍 Analizando TypeScript..." -ForegroundColor Yellow
try {
    $TsOutput = npm run type-check 2>&1
    if ($LASTEXITCODE -ne 0) {
        $TsLines = $TsOutput -split "`n" | Where-Object { $_.Trim() -ne "" }
        foreach ($line in $TsLines) {
            if ($line -match "^(.+?)\((\d+),(\d+)\):\s*(.+)$") {
                $File = $matches[1]
                $LineNum = $matches[2]
                $Message = $matches[4]
                $Severity = Get-WarningSeverity $Message
                Add-WarningToReport $Severity $File $LineNum $Message "TypeScript"
            }
        }
    }
    Write-Host "✅ TypeScript análisis completado" -ForegroundColor Green
} catch {
    Write-Host "❌ Error en análisis TypeScript: $($_.Exception.Message)" -ForegroundColor Red
}

# Análisis de ESLint
Write-Host "🔍 Analizando ESLint..." -ForegroundColor Yellow
try {
    $EslintOutput = npm run lint -- --format=compact 2>&1
    $EslintLines = $EslintOutput -split "`n" | Where-Object { $_.Trim() -ne "" }
    foreach ($line in $EslintLines) {
        if ($line -match "^(.+?):\s*line\s*(\d+),\s*col\s*(\d+),\s*(\w+)\s*-\s*(.+)$") {
            $File = $matches[1]
            $LineNum = $matches[2]
            $Type = $matches[4]
            $Message = $matches[5]
            $Severity = if ($Type -eq "error") { "HIGH" } else { Get-WarningSeverity $Message }
            Add-WarningToReport $Severity $File $LineNum $Message "ESLint"
        }
    }
    Write-Host "✅ ESLint análisis completado" -ForegroundColor Green
} catch {
    Write-Host "❌ Error en análisis ESLint: $($_.Exception.Message)" -ForegroundColor Red
}

# Análisis de Prettier
Write-Host "🔍 Analizando Prettier..." -ForegroundColor Yellow
try {
    $PrettierOutput = npm run format:check 2>&1
    if ($LASTEXITCODE -ne 0) {
        $PrettierLines = $PrettierOutput -split "`n" | Where-Object { $_ -match "\[warn\]" }
        foreach ($line in $PrettierLines) {
            $File = $line -replace "\[warn\]", "" | ForEach-Object { $_.Trim() }
            Add-WarningToReport "LOW" $File "N/A" "Formatting issues" "Prettier"
        }
    }
    Write-Host "✅ Prettier análisis completado" -ForegroundColor Green
} catch {
    Write-Host "❌ Error en análisis Prettier: $($_.Exception.Message)" -ForegroundColor Red
}

# Análisis de Python (si está disponible)
if (Test-Path "src-python") {
    Write-Host "🔍 Analizando Python..." -ForegroundColor Yellow
    try {
        $PythonFiles = Get-ChildItem "src-python" -Filter "*.py"
        foreach ($file in $PythonFiles) {
            try {
                python -m py_compile $file.FullName 2>&1 | Out-Null
                if ($LASTEXITCODE -ne 0) {
                    Add-WarningToReport "CRITICAL" $file.Name "N/A" "Python syntax error" "Python"
                }
            } catch {
                Add-WarningToReport "CRITICAL" $file.Name "N/A" "Python compilation error" "Python"
            }
        }
        Write-Host "✅ Python análisis completado" -ForegroundColor Green
    } catch {
        Write-Host "⚠️ Python no disponible o error en análisis" -ForegroundColor Yellow
    }
}

# Análisis de Rust (si está disponible)
if (Test-Path "src-tauri") {
    Write-Host "🔍 Analizando Rust..." -ForegroundColor Yellow
    try {
        Push-Location "src-tauri"
        $RustOutput = cargo check 2>&1
        $RustLines = $RustOutput -split "`n" | Where-Object { $_ -match "(warning|error):" }
        foreach ($line in $RustLines) {
            $Severity = if ($line -match "error:") { "CRITICAL" } else { "MEDIUM" }
            Add-WarningToReport $Severity "src-tauri" "N/A" $line.Trim() "Rust"
        }
        Pop-Location
        Write-Host "✅ Rust análisis completado" -ForegroundColor Green
    } catch {
        Pop-Location
        Write-Host "⚠️ Rust no disponible o error en análisis" -ForegroundColor Yellow
    }
}

# Completar reporte
$SummaryTable = @"

| Severidad | Cantidad | Descripción |
|-----------|----------|-------------|
| 🔥 Critical | $CriticalCount | Errores que impiden compilación |
| ⚠️ High | $HighCount | Problemas importantes de código |
| 📝 Medium | $MediumCount | Mejoras recomendadas |
| 💡 Low | $LowCount | Problemas menores de formato |

**Total de warnings**: $TotalWarnings

## 🎯 Recomendaciones

"@

$ReportContent = $ReportContent -replace "## 📊 Resumen Ejecutivo", "## 📊 Resumen Ejecutivo$SummaryTable"

if ($CriticalCount -gt 0) {
    $ReportContent += @"

### 🔥 ACCIÓN INMEDIATA REQUERIDA
- $CriticalCount errores críticos encontrados
- Estos errores impiden la compilación del proyecto
- **Prioridad MÁXIMA**: Resolver antes de cualquier commit

"@
}

if ($HighCount -gt 0) {
    $ReportContent += @"

### ⚠️ RESOLVER PRONTO
- $HighCount problemas importantes encontrados
- Pueden causar bugs o problemas de rendimiento
- **Prioridad ALTA**: Resolver en los próximos commits

"@
}

# Guardar reporte
$ReportContent | Out-File -FilePath $OutputFile -Encoding UTF8

# Mostrar resumen
Write-Host ""
Write-Host "✅ Análisis completado!" -ForegroundColor Green
Write-Host "📄 Reporte generado: $OutputFile" -ForegroundColor Cyan
Write-Host "📊 Total warnings: $TotalWarnings" -ForegroundColor White

if ($CriticalCount -gt 0) {
    Write-Host "🔥 ATENCIÓN: $CriticalCount errores críticos encontrados!" -ForegroundColor Red
}

Write-Host ""
Write-Host "Para ver el reporte completo, ejecuta:" -ForegroundColor Yellow
Write-Host "  Get-Content $OutputFile" -ForegroundColor Gray
