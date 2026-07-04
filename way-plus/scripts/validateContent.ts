import { ALL_STEPS } from '../src/content/registry';

console.log('🔍 Validando datos locales...');

const steps = Object.values(ALL_STEPS);
const waysCount = steps.reduce((acc, step) => acc + (step.ways?.length || 0), 0);

console.log(`✅ ${steps.length} steps válidos encontrados.`);
console.log(`✅ ${waysCount} ways válidos encontrados.`);

if (waysCount !== 57) {
  console.warn(`⚠️ Alerta: Se esperaban 57 ways, pero se encontraron ${waysCount}.`);
} else {
  console.log('🎉 Todo correcto. Puedes proceder con la subida.');
}
