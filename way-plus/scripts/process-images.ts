#!/usr/bin/env tsx
// scripts/process-images.ts
// Uso: npm run images:process -- ./carpeta-fotos-maite
// Requiere: npm install -D sharp

import sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TARGET_WIDTH = 400;
const TARGET_HEIGHT = 300;
const TARGET_QUALITY = 80; // Ajustar para ~25KB final
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'images', 'ways', 'webp');

const processImages = async (inputDir: string) => {
  if (!fs.existsSync(inputDir)) {
    console.error(`❌ Carpeta no encontrada: ${inputDir}`);
    process.exit(1);
  }

  // Asegurar directorio de salida
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const files = fs.readdirSync(inputDir)
    .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));

  console.log(`🖼️  Procesando ${files.length} imágenes...\n`);

  for (const file of files) {
    const inputPath = path.join(inputDir, file);
    // Extraer step y way del nombre si viene como way_s1_w1.jpg
    const match = file.match(/way_s(\d+)_w(\d+)/i);
    const outputName = match 
      ? `way_s${match[1]}_w${match[2]}.webp`
      : `${path.parse(file).name}.webp`;
    
    const outputPath = path.join(OUTPUT_DIR, outputName);

    try {
      const buffer = await sharp(inputPath)
        .resize(TARGET_WIDTH, TARGET_HEIGHT, { 
          fit: 'cover',
          position: 'center'
        })
        .webp({ 
          quality: TARGET_QUALITY,
          effort: 6, // Máxima compresión (0-6)
          smartSubsample: true 
        })
        .toBuffer();

      fs.writeFileSync(outputPath, buffer);
      
      const sizeKB = (buffer.length / 1024).toFixed(1);
      const status = parseFloat(sizeKB) <= 30 ? '✅' : '⚠️ ';
      console.log(`${status} ${outputName} → ${sizeKB}KB`);
      
    } catch (err) {
      console.error(`❌ Error procesando ${file}:`, err);
    }
  }

  console.log(`\n📁 Imágenes guardadas en: ${OUTPUT_DIR}`);
};

const inputDir = process.argv[2];
if (!inputDir) {
  console.log('Uso: npx tsx scripts/process-images.ts <carpeta-con-fotos>');
  console.log('Ejemplo: npx tsx scripts/process-images.ts ./fotos-maite-raw');
  process.exit(1);
}

processImages(path.resolve(inputDir));
