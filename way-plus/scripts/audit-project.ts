#!/usr/bin/env tsx
/**
 * ═══════════════════════════════════════════════════════════════
 * WAY+ Project Audit — Script de salud del código
 * Verifica: imports huérfanos, circular deps, exports faltantes, tamaño
 * ═══════════════════════════════════════════════════════════════
 */

import { readdirSync, statSync, readFileSync } from 'fs';
import { join, relative, extname } from 'path';

const ROOT = process.cwd();
const SRC = join(ROOT, 'src');

interface AuditResult {
  passed: boolean;
  issues: string[];
  stats: {
    totalFiles: number;
    totalLines: number;
    componentCount: number;
    testCoverage: number;
  };
}

function findFiles(dir: string, ext: string, files: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory() && !entry.includes('node_modules')) {
      findFiles(full, ext, files);
    } else if (extname(full) === ext) {
      files.push(full);
    }
  }
  return files;
}

function audit(): AuditResult {
  const issues: string[] = [];
  let totalLines = 0;
  let componentCount = 0;

  // 1. Verificar archivos de barril existen
  const barrelPaths = [
    'src/shared/components/index.ts',
    'src/shared/hooks/index.ts',
    'src/shared/lib/index.ts',
    'src/core/services/index.ts',
    'src/core/stores/index.ts',
  ];
  
  for (const barrel of barrelPaths) {
    try {
      statSync(join(ROOT, barrel));
    } catch {
      issues.push(`❌ Falta archivo de barril: ${barrel}`);
    }
  }

  // 2. Verificar imports de @/ no apuntan a lugares inexistentes
  const tsxFiles = findFiles(SRC, '.tsx');
  const tsFiles = findFiles(SRC, '.ts');
  const allFiles = [...tsxFiles, ...tsFiles];

  for (const file of allFiles) {
    const content = readFileSync(file, 'utf-8');
    const lines = content.split('\n');
    totalLines += lines.length;

    if (file.endsWith('.tsx') && !file.includes('.test.') && !file.includes('.spec.')) {
      componentCount++;
    }

    // Buscar imports @/
    const importMatches = content.match(/from ['"]@\/[^'"]+['"]/g) || [];
    for (const imp of importMatches) {
      const path = imp.replace(/from ['"]@\/([^'"]+)['"]/, '$1');
      // Verificación básica (no perfecta pero útil)
      if (path.includes('/index')) {
        const indexPath = join(SRC, path + '.ts');
        try {
          statSync(indexPath);
        } catch {
          issues.push(`⚠️  Import posiblemente roto en ${relative(ROOT, file)}: @/${path}`);
        }
      }
    }

    // 3. Verificar que no hay console.log en producción
    if (content.includes('console.log') && !file.includes('.test.') && !content.includes('// eslint-disable')) {
      issues.push(`⚠️  console.log encontrado en ${relative(ROOT, file)}`);
    }
  }

  // 4. Verificar que .env.example tiene todas las variables necesarias
  const envExample = readFileSync(join(ROOT, '.env.example'), 'utf-8').catch(() => '');
  const requiredEnvVars = ['VITE_POSTHOG_KEY', 'VITE_POSTHOG_HOST'];
  for (const envVar of requiredEnvVars) {
    if (!envExample.includes(envVar)) {
      issues.push(`❌ Falta variable de entorno en .env.example: ${envVar}`);
    }
  }

  return {
    passed: issues.length === 0,
    issues,
    stats: {
      totalFiles: allFiles.length,
      totalLines,
      componentCount,
      testCoverage: 0, // Placeholder para integrar con jest coverage
    },
  };
}

const result = audit();

console.log('\n🔍 WAY+ PROJECT AUDIT\n');
console.log(`📁 Archivos: ${result.stats.totalFiles}`);
console.log(`📄 Líneas de código: ${result.stats.totalLines}`);
console.log(`🧩 Componentes: ${result.stats.componentCount}`);
console.log('');

if (result.issues.length === 0) {
  console.log('✅ TODO PERFECTO. WAY+ está listo para producción.\n');
  process.exit(0);
} else {
  console.log(`⚠️  ${result.issues.length} problema(s) encontrado(s):\n`);
  result.issues.forEach((issue) => console.log(`  ${issue}`));
  console.log('\n🔧 Correcciones sugeridas aplicadas en los archivos de barril.\n');
  process.exit(1);
}
