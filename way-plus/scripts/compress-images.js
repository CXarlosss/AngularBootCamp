import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_DIR = path.resolve(__dirname, '../public/images/ways');
const OUTPUT_DIR = path.resolve(__dirname, '../public/images/ways/webp');

// Asegurar directorio de salida
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function compressImages() {
  const files = fs.readdirSync(INPUT_DIR);
  
  console.log(`🚀 Iniciando compresión de ${files.length} imágenes...`);

  for (const file of files) {
    if (file.match(/\.(jpg|jpeg|png)$/i)) {
      const inputPath = path.join(INPUT_DIR, file);
      const outputName = file.replace(/\.(jpg|jpeg|png)$/i, '.webp');
      const outputPath = path.join(OUTPUT_DIR, outputName);

      try {
        await sharp(inputPath)
          .webp({ quality: 75 })
          .toFile(outputPath);
        
        const oldSize = fs.statSync(inputPath).size / 1024;
        const newSize = fs.statSync(outputPath).size / 1024;
        
        console.log(`✅ ${file}: ${oldSize.toFixed(1)}KB -> ${newSize.toFixed(1)}KB (${Math.round((1 - newSize/oldSize) * 100)}% ahorro)`);
      } catch (err) {
        console.error(`❌ Error comprimiendo ${file}:`, err);
      }
    }
  }
  
  console.log('✨ ¡Compresión finalizada!');
}

compressImages();
