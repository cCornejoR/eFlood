#!/usr/bin/env node

/**
 * 🔍 eFlood² Warning Analyzer
 *
 * Analiza todo el código del proyecto buscando warnings y los clasifica por criticidad.
 * Genera un reporte detallado para identificar los problemas más importantes.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de análisis
const CONFIG = {
  outputFile: 'warnings-report.md',
  projectName: 'eFlood²',

  // Patrones de criticidad para warnings
  criticalPatterns: [
    /error TS\d+/i,
    /Cannot find module/i,
    /Module .* not found/i,
    /Property .* does not exist/i,
    /Type .* is not assignable/i,
    /Argument of type .* is not assignable/i,
    /Object is possibly 'null'/i,
    /Object is possibly 'undefined'/i,
    /Variable .* is used before being assigned/i,
    /Function lacks ending return statement/i
  ],

  highPatterns: [
    /Unexpected any/i,
    /no-explicit-any/i,
    /React Hook .* has missing dependencies/i,
    /React Hook .* has a missing dependency/i,
    /exhaustive-deps/i,
    /no-unused-vars/i,
    /declared but its value is never read/i,
    /is declared but never used/i,
    /Fast refresh only works when/i
  ],

  mediumPatterns: [
    /Prefer const assertions/i,
    /Missing return type/i,
    /no-console/i,
    /prefer-const/i,
    /no-var/i,
    /eqeqeq/i,
    /curly/i
  ],

  lowPatterns: [
    /prettier\/prettier/i,
    /Delete.*prettier/i,
    /Insert.*prettier/i,
    /Replace.*prettier/i,
    /Delete `␍`/i,
    /Insert `␍`/i,
    /Replace `␍`/i,
    /trailing-whitespace/i,
    /end-of-file-fixer/i,
    /Expected linebreaks/i,
    /Unexpected linebreak/i
  ]
};

class WarningAnalyzer {
  constructor() {
    this.warnings = {
      critical: [],
      high: [],
      medium: [],
      low: [],
      unknown: []
    };
    this.stats = {
      total: 0,
      byType: {},
      byFile: {},
      bySeverity: {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        unknown: 0
      }
    };
  }

  // Ejecutar análisis de TypeScript
  analyzeTypeScript() {
    console.log('🔍 Analizando TypeScript...');
    try {
      execSync('npm run type-check', { stdio: 'pipe' });
      console.log('✅ TypeScript: Sin errores');
    } catch (error) {
      const output = error.stdout?.toString() || error.stderr?.toString() || '';
      this.parseTypeScriptOutput(output);
    }
  }

  // Ejecutar análisis de ESLint
  analyzeESLint() {
    console.log('🔍 Analizando ESLint...');
    try {
      // ESLint con warnings permitidos para capturar todos los problemas
      const output = execSync('npm run lint -- --max-warnings=1000', {
        stdio: 'pipe',
        encoding: 'utf8'
      });
      this.parseESLintOutput(output);
    } catch (error) {
      const output = error.stdout?.toString() || error.stderr?.toString() || '';
      this.parseESLintOutput(output);
    }
  }

  // Ejecutar análisis de Prettier
  analyzePrettier() {
    console.log('🔍 Analizando Prettier...');
    try {
      execSync('npm run format:check', { stdio: 'pipe' });
      console.log('✅ Prettier: Sin problemas de formato');
    } catch (error) {
      const output = error.stdout?.toString() || error.stderr?.toString() || '';
      this.parsePrettierOutput(output);
    }
  }

  // Analizar archivos Python (si están disponibles)
  analyzePython() {
    console.log('🔍 Analizando Python...');
    try {
      if (fs.existsSync('src-python')) {
        // Verificar sintaxis básica
        const files = fs.readdirSync('src-python').filter(f => f.endsWith('.py'));
        files.forEach(file => {
          try {
            execSync(`python3 -m py_compile src-python/${file}`, { stdio: 'pipe' });
          } catch (error) {
            this.addWarning('critical', `Python syntax error in ${file}`, file, error.message);
          }
        });
        console.log('✅ Python: Sintaxis verificada');
      }
    } catch (error) {
      console.log('⚠️ Python: No disponible o error en análisis');
    }
  }

  // Analizar archivos Rust (si están disponibles)
  analyzeRust() {
    console.log('🔍 Analizando Rust...');
    try {
      if (fs.existsSync('src-tauri')) {
        const output = execSync('cd src-tauri && cargo check', {
          stdio: 'pipe',
          encoding: 'utf8'
        });
        this.parseRustOutput(output);
        console.log('✅ Rust: Verificación completada');
      }
    } catch (error) {
      const output = error.stdout?.toString() || error.stderr?.toString() || '';
      this.parseRustOutput(output);
    }
  }

  // Parsear salida de TypeScript
  parseTypeScriptOutput(output) {
    const lines = output.split('\n').filter(line => line.trim());
    lines.forEach(line => {
      if (line.includes('error TS') || line.includes('Error:')) {
        const match = line.match(/^(.+?)\((\d+),(\d+)\):\s*(.+)$/);
        if (match) {
          const [, file, lineNum, col, message] = match;
          const severity = this.classifyWarning(message);
          this.addWarning(severity, message, file, `Line ${lineNum}:${col}`);
        }
      }
    });
  }

  // Parsear salida de ESLint
  parseESLintOutput(output) {
    const lines = output.split('\n').filter(line => line.trim());

    lines.forEach((line) => {
      // Formato típico de ESLint: archivo  línea:columna  tipo  mensaje  regla
      const match = line.match(/^(.+?)\s+(\d+):(\d+)\s+(error|warning)\s+(.+?)(?:\s+(@[\w-]+\/[\w-]+|[\w-]+))?$/);

      if (match) {
        const [, file, lineNum, col, type, message] = match;
        // Clasificar primero por mensaje, luego por tipo
        let severity = this.classifyWarning(message);
        if (severity === 'unknown' && type === 'error') {
          severity = 'high';
        }
        this.addWarning(severity, message.trim(), file.trim(), `Line ${lineNum}:${col}`);
      }
    });
  }

  // Parsear salida de Prettier
  parsePrettierOutput(output) {
    const lines = output.split('\n').filter(line => line.trim());
    lines.forEach(line => {
      if (line.includes('[warn]')) {
        const file = line.replace('[warn]', '').trim();
        this.addWarning('low', 'Formatting issues', file, 'Prettier');
      }
    });
  }

  // Parsear salida de Rust
  parseRustOutput(output) {
    const lines = output.split('\n').filter(line => line.trim());
    lines.forEach(line => {
      if (line.includes('warning:') || line.includes('error:')) {
        const severity = line.includes('error:') ? 'critical' : 'medium';
        this.addWarning(severity, line.trim(), 'src-tauri', 'Cargo');
      }
    });
  }

  // Clasificar warning por criticidad
  classifyWarning(message) {
    if (CONFIG.criticalPatterns.some(pattern => pattern.test(message))) {
      return 'critical';
    }
    if (CONFIG.highPatterns.some(pattern => pattern.test(message))) {
      return 'high';
    }
    if (CONFIG.mediumPatterns.some(pattern => pattern.test(message))) {
      return 'medium';
    }
    if (CONFIG.lowPatterns.some(pattern => pattern.test(message))) {
      return 'low';
    }
    return 'unknown';
  }

  // Agregar warning al reporte
  addWarning(severity, message, file, location) {
    const warning = {
      message,
      file: file.replace(process.cwd(), '').replace(/^[\/\\]/, ''),
      location,
      timestamp: new Date().toISOString()
    };

    this.warnings[severity].push(warning);
    this.stats.total++;
    this.stats.bySeverity[severity]++;

    // Estadísticas por archivo
    if (!this.stats.byFile[warning.file]) {
      this.stats.byFile[warning.file] = 0;
    }
    this.stats.byFile[warning.file]++;
  }

  // Generar reporte en Markdown
  generateReport() {
    console.log('📝 Generando reporte...');

    const timestamp = new Date().toISOString();
    let report = `# 🔍 Reporte de Warnings - ${CONFIG.projectName}\n\n`;
    report += `**Generado**: ${timestamp}\n`;
    report += `**Total de warnings**: ${this.stats.total}\n\n`;

    // Resumen por severidad
    report += `## 📊 Resumen por Severidad\n\n`;
    report += `| Severidad | Cantidad | Descripción |\n`;
    report += `|-----------|----------|-------------|\n`;
    report += `| 🔥 Critical | ${this.stats.bySeverity.critical} | Errores que impiden compilación |\n`;
    report += `| ⚠️ High | ${this.stats.bySeverity.high} | Problemas importantes de código |\n`;
    report += `| 📝 Medium | ${this.stats.bySeverity.medium} | Mejoras recomendadas |\n`;
    report += `| 💡 Low | ${this.stats.bySeverity.low} | Problemas menores de formato |\n`;
    report += `| ❓ Unknown | ${this.stats.bySeverity.unknown} | Warnings no clasificados |\n\n`;

    // Archivos con más warnings
    const topFiles = Object.entries(this.stats.byFile)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);

    if (topFiles.length > 0) {
      report += `## 📁 Archivos con Más Warnings\n\n`;
      topFiles.forEach(([file, count]) => {
        report += `- **${file}**: ${count} warnings\n`;
      });
      report += `\n`;
    }

    // Detalles por severidad
    ['critical', 'high', 'medium', 'low', 'unknown'].forEach(severity => {
      if (this.warnings[severity].length > 0) {
        const icon = {
          critical: '🔥',
          high: '⚠️',
          medium: '📝',
          low: '💡',
          unknown: '❓'
        }[severity];

        report += `## ${icon} ${severity.toUpperCase()} (${this.warnings[severity].length})\n\n`;

        this.warnings[severity].forEach((warning, index) => {
          report += `### ${index + 1}. ${warning.file}\n`;
          report += `**Ubicación**: ${warning.location}\n`;
          report += `**Mensaje**: \`${warning.message}\`\n\n`;
        });
      }
    });

    // Recomendaciones
    report += `## 🎯 Recomendaciones de Acción\n\n`;

    if (this.stats.bySeverity.critical > 0) {
      report += `### 🔥 CRÍTICO - Acción Inmediata Requerida\n`;
      report += `- ${this.stats.bySeverity.critical} errores críticos encontrados\n`;
      report += `- Estos errores impiden la compilación del proyecto\n`;
      report += `- **Prioridad**: MÁXIMA - Resolver antes de cualquier commit\n\n`;
    }

    if (this.stats.bySeverity.high > 0) {
      report += `### ⚠️ ALTO - Resolver Pronto\n`;
      report += `- ${this.stats.bySeverity.high} problemas importantes encontrados\n`;
      report += `- Pueden causar bugs o problemas de rendimiento\n`;
      report += `- **Prioridad**: ALTA - Resolver en los próximos commits\n\n`;
    }

    if (this.stats.bySeverity.medium > 0) {
      report += `### 📝 MEDIO - Mejoras Recomendadas\n`;
      report += `- ${this.stats.bySeverity.medium} mejoras recomendadas\n`;
      report += `- Mejorarán la calidad y mantenibilidad del código\n`;
      report += `- **Prioridad**: MEDIA - Resolver cuando sea conveniente\n\n`;
    }

    return report;
  }

  // Ejecutar análisis completo
  async run() {
    console.log(`🚀 Iniciando análisis de warnings para ${CONFIG.projectName}...\n`);

    try {
      this.analyzeTypeScript();
      this.analyzeESLint();
      this.analyzePrettier();
      this.analyzePython();
      this.analyzeRust();

      const report = this.generateReport();
      fs.writeFileSync(CONFIG.outputFile, report);

      console.log(`\n✅ Análisis completado!`);
      console.log(`📄 Reporte generado: ${CONFIG.outputFile}`);
      console.log(`📊 Total warnings encontrados: ${this.stats.total}`);

      if (this.stats.bySeverity.critical > 0) {
        console.log(`🔥 ATENCIÓN: ${this.stats.bySeverity.critical} errores críticos encontrados!`);
      }

      return this.stats;
    } catch (error) {
      console.error('❌ Error durante el análisis:', error.message);
      throw error;
    }
  }
}

// Ejecutar automáticamente
const analyzer = new WarningAnalyzer();
analyzer.run().catch(console.error);

export default WarningAnalyzer;
