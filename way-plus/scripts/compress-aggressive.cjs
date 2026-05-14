const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const WAYS_DIR = path.join(__dirname, '../public/images/ways');
const WEBP_DIR = path.join(WAYS_DIR, 'webp');

async function compress() {
  console.log('🚀 Iniciando compresión agresiva (sharp)...');
  
  if (!fs.existsSync(WEBP_DIR)) {
    fs.mkdirSync(WEBP_DIR, { recursive: true });
  }

  const files = fs.readdirSync(WAYS_DIR);
  const tasks = files
    .filter(f => f.endsWith('.jpg') || f.endsWith('.png') || f.endsWith('.jpeg'))
    .map(async (file) => {
      const inputPath = path.join(WAYS_DIR, file);
      const fileName = path.parse(file).name;
      const outputPath = path.join(WEBP_DIR, `${fileName}.webp`);

      console.log(`⏳ Procesando: ${file}...`);
      
      try {
        await sharp(inputPath)
          .resize(600, 450, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 65 })
          .toFile(outputPath);
        
        const oldSize = fs.statSync(inputPath).size / 1024;
        const newSize = fs.statSync(outputPath).size / 1024;
        const reduction = ((1 - newSize / oldSize) * 100).toFixed(1);
        
        console.log(`✅ COMPLETADO: ${fileName}.webp (${newSize.toFixed(1)} KB) - Reducción del ${reduction}%`);
      } catch (err) {
        console.error(`❌ Error procesando ${file}:`, err.message);
      }
    });

  await Promise.all(tasks);
  console.log('\n✨ Todas las imágenes han sido optimizadas para el niño.');
}

compress();
