#!/usr/bin/env tsx
// scripts/wayGenerator.ts
// Uso: npx tsx scripts/wayGenerator.ts
// Requiere: npm install -D tsx

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================
// CONFIGURACIÓN
// ============================================================

const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'src', 'data');
const OUTPUT_DIR = path.join(ROOT_DIR, 'src', 'content', 'levels', 'pregamer', 'steps'); // Actualizado a la ruta correcta en el proyecto

// Asegurar que existe el directorio de salida
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// ============================================================
// INTERFACES (duplicadas de ways-master-data.ts para independencia)
// ============================================================

interface WayMasterEntry {
  id: string;
  step: 1 | 2 | 3;
  stepTitle: string;
  wayNumber: number;
  title: string;
  shortDescription: string;
  stimulusType: 'text' | 'voice' | 'image';
  stimulusText?: string;
  stimulusAudioUrl?: string;
  stimulusImageUrl?: string;
  choiceA: string;
  choiceB: string;
  correctChoice: 'A' | 'B';
  theme: 'relaxation' | 'self-esteem' | 'assertiveness';
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTimeSeconds: number;
  imageFilename: string;
  hasRealImage: boolean;
  isHomeworkEligible: boolean;
  requiredWaysCompleted?: string[];
  skills: string[];
}

// ============================================================
// PLANTILLAS DE GENERACIÓN
// ============================================================

/**
 * Genera el contenido de un módulo de ways (relaxation.ts, autonomy.ts, etc.)
 * Respetando el formato exacto que usa WayRenderer.tsx
 */
const generateModuleFile = (ways: WayMasterEntry[], moduleName: string): string => {
  const stepNumber = ways[0]?.step ?? 1;
  const stepTitle = ways[0]?.stepTitle ?? 'STEP';
  const theme = ways[0]?.theme ?? 'default';
  
  const wayObjects = ways.map(way => {
    // Construir el objeto stimulus según el tipo
    let stimulusCode = '';
    if (way.stimulusType === 'text') {
      stimulusCode = `{
        image: 'https://img.icons8.com/color/512/important.png', // Fallback image for now
        text: '${escapeString(way.stimulusText || way.shortDescription)}'
      }`;
    } else if (way.stimulusType === 'voice') {
      stimulusCode = `{
        audio: '${way.stimulusAudioUrl || ''}',
        text: '${escapeString(way.shortDescription)}'
      }`;
    } else {
      stimulusCode = `{
        image: '${way.stimulusImageUrl || `/images/ways/webp/${way.imageFilename}`}',
        text: '${escapeString(way.title)}'
      }`;
    }

    const difficultyMap: Record<string, number> = { easy: 1, medium: 2, hard: 3 };

    return `    {
      id: '${way.id}',
      name: '${escapeString(way.title)}',
      stepId: 'step-${moduleName}-1',
      order: ${way.wayNumber},
      type: 'double-choice',
      stepNumber: ${way.step},
      wayNumber: ${way.wayNumber},
      stimulus: ${stimulusCode},
      options: [
        {
          id: '${way.id}-opt-a',
          image: 'https://img.icons8.com/color/512/happy.png',
          label: '${escapeString(way.choiceA)}',
          isCorrect: ${way.correctChoice === 'A'},
          feedback: { visual: '${way.correctChoice === 'A' ? 'happy' : 'sad'}' }
        },
        {
          id: '${way.id}-opt-b',
          image: 'https://img.icons8.com/color/512/sad.png',
          label: '${escapeString(way.choiceB)}',
          isCorrect: ${way.correctChoice === 'B'},
          feedback: { visual: '${way.correctChoice === 'B' ? 'happy' : 'sad'}' }
        }
      ],
      metadata: { skillTag: '${way.skills[0] || 'general'}', difficulty: ${difficultyMap[way.difficulty] || 1}, estimatedTime: ${way.estimatedTimeSeconds} }
    }`;
  }).join(',\n');

  return `// ============================================
// ${moduleName}.ts
// GENERADO AUTOMÁTICAMENTE por wayGenerator.ts
// NO EDITAR MANUALMENTE — Modificar ways-master-data.ts y regenerar
// Fecha: ${new Date().toISOString()}
// Ways incluidos: ${ways.length}
// ============================================

import type { Step } from '@/core/engine/types';

export const ${moduleName}Step: Step = {
  id: 'step-${moduleName}-1',
  levelId: 'pregamer',
  stepNumber: ${stepNumber},
  title: '${escapeString(stepTitle)}',
  theme: '${theme}',
  ways: [
${wayObjects}
  ],
  completionReward: {
    coins: 100,
    xp: 150
  }
};
`;
};

/** Escapa comillas simples y caracteres problemáticos para strings TS */
const escapeString = (str: string): string => {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '');
};

// ============================================================
// FUNCIÓN PRINCIPAL
// ============================================================

const run = () => {
  console.log('🚀 WAY+ Way Generator\n');
  
  const jsonPath = path.join(DATA_DIR, 'ways-master-data.json');
  
  let ways: WayMasterEntry[];
  
  if (fs.existsSync(jsonPath)) {
    ways = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    console.log(`   ✅ Cargados ${ways.length} ways desde JSON.`);
  } else {
    console.error(`❌ No se encontró ${jsonPath}`);
    console.error('   Exporta waysMasterData a JSON primero.');
    process.exit(1);
  }

  // Agrupar por step
  const byStep: Record<number, WayMasterEntry[]> = {
    1: ways.filter(w => w.step === 1),
    2: ways.filter(w => w.step === 2),
    3: ways.filter(w => w.step === 3),
  };

  // Generar archivos
  const modules = [
    { step: 1, name: 'relaxation', file: 'relaxation.ts' },
    { step: 2, name: 'autonomy', file: 'autonomy.ts' },
    { step: 3, name: 'assertiveness', file: 'assertiveness.ts' },
  ];

  for (const mod of modules) {
    const stepWays = byStep[mod.step];
    const outputPath = path.join(OUTPUT_DIR, mod.file);
    const content = generateModuleFile(stepWays, mod.name);
    
    fs.writeFileSync(outputPath, content, 'utf-8');
    console.log(`✅ ${mod.file} generado (${stepWays.length} ways) → ${path.relative(ROOT_DIR, outputPath)}`);
  }

  // Resumen
  const total = ways.length;
  const expected = 57;
  console.log(`\n📊 Resumen:`);
  console.log(`   Total ways: ${total}/${expected}`);
  console.log(`   Faltan: ${Math.max(0, expected - total)}`);
  console.log(`\n🎉 Generación completada. Revisa los archivos en ${path.relative(ROOT_DIR, OUTPUT_DIR)}/`);
};

run();
