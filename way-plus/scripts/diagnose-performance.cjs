const fs = require('fs');
const path = require('path');

const WAYS_DIR = path.join(__dirname, '../public/images/ways');

function diagnose() {
  console.log('🔍 Iniciando diagnóstico de rendimiento visual...');
  
  if (!fs.existsSync(WAYS_DIR)) {
    console.error('❌ Error: No se encontró el directorio de imágenes: ' + WAYS_DIR);
    return;
  }

  const files = fs.readdirSync(WAYS_DIR);
  let totalSize = 0;
  let heavyCount = 0;
  const report = [];

  files.forEach(file => {
    const filePath = path.join(WAYS_DIR, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isFile()) {
      const sizeKB = stats.size / 1024;
      totalSize += stats.size;
      
      if (sizeKB > 100) {
        heavyCount++;
        report.push({
          file,
          size: sizeKB.toFixed(2) + ' KB',
          status: '🔴 CRÍTICO'
        });
      } else {
        report.push({
          file,
          size: sizeKB.toFixed(2) + ' KB',
          status: '🟢 OK'
        });
      }
    }
  });

  console.log('\n📊 RESUMEN DE DIAGNÓSTICO:');
  console.log('---------------------------');
  console.log(`Total imágenes: ${files.filter(f => fs.statSync(path.join(WAYS_DIR, f)).isFile()).length}`);
  console.log(`Imágenes pesadas (>100KB): ${heavyCount}`);
  console.log(`Tamaño total: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log('---------------------------\n');

  console.table(report);

  if (heavyCount > 0) {
    console.log('\n⚠️ ACCIÓN REQUERIDA: El niño se frustrará con estos pesos.');
    console.log('Se recomienda ejecutar el script de compresión agresiva.');
  } else {
    console.log('\n✅ Rendimiento visual óptimo.');
  }
}

diagnose();
