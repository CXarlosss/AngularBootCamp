import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'images', 'ways', 'webp');
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// Lista de placeholders necesarios (41 ways faltantes)
const placeholders = [
  // STEP 1: w2-w6
  ...Array.from({ length: 5 }, (_, i) => `way_s1_w${i + 2}.webp`),
  // STEP 2: w2-w29
  ...Array.from({ length: 28 }, (_, i) => `way_s2_w${i + 2}.webp`),
  // STEP 3: w2-w22
  ...Array.from({ length: 21 }, (_, i) => `way_s3_w${i + 2}.webp`),
];

let created = 0;
let existing = 0;

for (const filename of placeholders) {
  const filepath = path.join(OUTPUT_DIR, filename);
  if (fs.existsSync(filepath)) {
    existing++;
  } else {
    fs.writeFileSync(filepath, ''); // Vacío: wayImageService usará fallback
    created++;
  }
}

console.log(`✅ Creados: ${created} placeholders`);
console.log(`📁 Ya existían: ${existing}`);
console.log(`📂 Total en ${OUTPUT_DIR}: ${fs.readdirSync(OUTPUT_DIR).length} archivos`);
